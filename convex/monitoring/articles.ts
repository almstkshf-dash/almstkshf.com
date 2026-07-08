/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v, ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { parsePublishedDate } from "../utils/date";
import {
    queryArticlesWithIndex,
    isValidWebUrl,
    createTimestampCache
} from "./helpers";
import {
    sentimentValidator,
    sourceTypeValidator,
    depthValidator,
    analysisStatusValidator,
    languageValidator,
    emotionsValidator
} from "./validators";

// 1. QUERY: Get all articles for the dashboard
export const getArticles = query({
    args: {
        limit: v.optional(v.number()),
        skip: v.optional(v.number()),
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;
        const skip = args.skip ?? 0;

        const q = queryArticlesWithIndex(ctx, args);
        // Optimize: Bounded read to avoid nearing transaction limits on large tables
        const maxToFetch = Math.max(300, (limit + skip) * 2);
        const all = await q.take(maxToFetch);

        const getTimestamp = createTimestampCache();

        all.sort((a: Doc<"media_monitoring_articles">, b: Doc<"media_monitoring_articles">) => {
            const da = getTimestamp(a);
            const db = getTimestamp(b);
            if (db !== da) return db - da;
            return (b.createdAt || 0) - (a.createdAt || 0);
        });

        const slice = all.slice(skip, skip + limit);
        return {
            items: slice,
            total: all.length,
            nextSkip: skip + slice.length < all.length ? skip + slice.length : null,
        };
    },
});

// 1.5. QUERY: Check if article exists by URL
export const checkDuplicate = query({
    args: { url: v.string() },
    handler: async (ctx, args) => {
        if (!isValidWebUrl(args.url)) {
            throw new ConvexError("InvalidURL: The provided URL scheme is not supported.");
        }
        const existing = await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_url", (q) => q.eq("url", args.url))
            .first();
        return !!existing;
    },
});

// 2. MUTATION: Save a single article
export const saveArticle = mutation({
    args: {
        keyword: v.string(),
        url: v.string(),
        resolvedUrl: v.optional(v.string()),
        publishedDate: v.string(),
        title: v.string(),
        content: v.string(),
        language: languageValidator,
        sentiment: sentimentValidator,
        sourceType: sourceTypeValidator,
        sourceCountry: v.string(),
        source: v.optional(v.string()),
        depth: v.optional(depthValidator),
        ingestMethod: v.optional(v.union(v.literal("api"), v.literal("rss"), v.literal("headless"))),
        tone: v.optional(v.string()),
        risk: v.optional(v.string()),
        reach: v.number(),
        ave: v.number(),
        imageUrl: v.optional(v.string()),
        isManual: v.optional(v.boolean()),
        likes: v.optional(v.number()),
        retweets: v.optional(v.number()),
        replies: v.optional(v.number()),
        publisherUsername: v.optional(v.string()),
        relevancy_score: v.optional(v.number()),
        manualSentimentOverride: v.optional(v.boolean()),
        originalSentiment: v.optional(v.string()),
        hashtags: v.optional(v.array(v.string())),
        emotions: v.optional(emotionsValidator),
        analysisStatus: v.optional(analysisStatusValidator),
        sourceId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        try {
            // Security: Prevent unsafe protocols (javascript:, ftp:, data:)
            if (!isValidWebUrl(args.url)) {
                throw new ConvexError("InvalidURL: The main URL has an invalid or unsafe protocol scheme.");
            }
            if (args.resolvedUrl && !isValidWebUrl(args.resolvedUrl)) {
                throw new ConvexError("InvalidURL: The resolved URL has an invalid or unsafe protocol scheme.");
            }

            // Fast lookup by url / resolvedUrl to prevent OCC range contention
            let existing = await ctx.db
                .query("media_monitoring_articles")
                .withIndex("by_url", (q) => q.eq("url", args.url))
                .filter((q) => q.eq(q.field("title"), args.title))
                .first();

            if (!existing && args.resolvedUrl) {
                existing = await ctx.db
                    .query("media_monitoring_articles")
                    .withIndex("by_resolvedUrl", (q) => q.eq("resolvedUrl", args.resolvedUrl!))
                    .filter((q) => q.eq(q.field("title"), args.title))
                    .first();
            }

            if (!existing && args.resolvedUrl) {
                existing = await ctx.db
                    .query("media_monitoring_articles")
                    .withIndex("by_url", (q) => q.eq("url", args.resolvedUrl!))
                    .filter((q) => q.eq(q.field("title"), args.title))
                    .first();
            }

            if (!existing) {
                existing = await ctx.db
                    .query("media_monitoring_articles")
                    .withIndex("by_resolvedUrl", (q) => q.eq("resolvedUrl", args.url))
                    .filter((q) => q.eq(q.field("title"), args.title))
                    .first();
            }

            if (existing) {
                if (args.isManual) {
                    throw new ConvexError("DuplicateArticle: This article already exists in your monitoring feed.");
                }
                return existing._id;
            }

            // Precompute publication timestamp
            const publishedTimestamp = parsePublishedDate(args.publishedDate)?.getTime() ?? Date.now();

            // Auto-resolve sourceId if not provided
            let resolvedSourceId = args.sourceId;
            if (!resolvedSourceId && args.source) {
                const found = await ctx.db
                    .query("media_sources")
                    .filter((q) => q.eq(q.field("name"), args.source))
                    .first();
                if (found) {
                    resolvedSourceId = found.sourceId;
                }
            }

            const id = await ctx.db.insert("media_monitoring_articles", {
                ...args,
                sourceId: resolvedSourceId,
                publishedTimestamp,
                createdAt: Date.now(),
                depth: args.depth ?? "standard",
                manualSentimentOverride: args.manualSentimentOverride ?? false,
                originalSentiment: args.originalSentiment ?? args.sentiment,
            });

            if (args.analysisStatus === "pending") {
                await ctx.db.insert("scraper_queue", {
                    url: args.url,
                    articleId: id,
                    status: "pending",
                    retryCount: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
                await ctx.scheduler.runAfter(0, internal.monitoringAction.processQueueBatch, {});
            }
            return id;
        } catch (error) {
            // Log identifiers and avoid raw dump of content body / usernames
            console.error(`saveArticle failed. URL: ${args.url}, Title: ${args.title.substring(0, 50)}...`);
            console.error("saveArticle error details:", error instanceof Error ? error.message : error);
            throw error;
        }
    },
});

// MUTATION: Update article after background analysis completes
export const updateArticleAfterAnalysis = mutation({
    args: {
        id: v.id("media_monitoring_articles"),
        sentiment: sentimentValidator,
        analysisStatus: v.union(v.literal("completed"), v.literal("failed")),
        tone: v.optional(v.string()),
        risk: v.optional(v.string()),
        reach: v.number(),
        ave: v.number(),
        relevancy_score: v.optional(v.number()),
        emotions: v.optional(emotionsValidator),
        sourceCountry: v.optional(v.string()),
        source: v.optional(v.string()),
        resolvedUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        content: v.optional(v.string()),
        depth: v.optional(depthValidator),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new ConvexError("ArticleNotFound: Article not found");

        if (fields.resolvedUrl && !isValidWebUrl(fields.resolvedUrl)) {
            throw new ConvexError("InvalidURL: The resolved URL protocol scheme is not supported.");
        }

        await ctx.db.patch(id, {
            ...fields,
            originalSentiment: existing.originalSentiment ?? fields.sentiment ?? existing.sentiment,
        });
    },
});

// QUERY: Retrieve a single article by ID
export const getArticle = query({
    args: { id: v.id("media_monitoring_articles") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// 3. MUTATION: Delete a single article
export const deleteArticle = mutation({
    args: { id: v.id("media_monitoring_articles") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// 3.1. MUTATION: Update a single article's details (both manual and auto-ingested)
export const updateArticle = mutation({
    args: {
        id: v.id("media_monitoring_articles"),
        keyword: v.optional(v.string()),
        url: v.optional(v.string()),
        resolvedUrl: v.optional(v.string()),
        publishedDate: v.optional(v.string()),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        language: v.optional(languageValidator),
        sentiment: v.optional(sentimentValidator),
        sourceType: v.optional(sourceTypeValidator),
        sourceCountry: v.optional(v.string()),
        source: v.optional(v.string()),
        depth: v.optional(depthValidator),
        reach: v.optional(v.number()),
        ave: v.optional(v.number()),
        imageUrl: v.optional(v.string()),
        likes: v.optional(v.number()),
        retweets: v.optional(v.number()),
        replies: v.optional(v.number()),
        publisherUsername: v.optional(v.string()),
        sourceId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new ConvexError("ArticleNotFound: Article not found");

        if (fields.url && !isValidWebUrl(fields.url)) {
            throw new ConvexError("InvalidURL: The main URL protocol scheme is not supported.");
        }
        if (fields.resolvedUrl && !isValidWebUrl(fields.resolvedUrl)) {
            throw new ConvexError("InvalidURL: The resolved URL protocol scheme is not supported.");
        }

        const patches: any = { ...fields };

        // Auto-resolve sourceId if not provided but source is updated/present
        if (!patches.sourceId && (patches.source || existing.source)) {
            const sourceName = patches.source || existing.source;
            if (sourceName) {
                const found = await ctx.db
                    .query("media_sources")
                    .filter((q) => q.eq(q.field("name"), sourceName))
                    .first();
                if (found) {
                    patches.sourceId = found.sourceId;
                }
            }
        }

        // Parse and update publishedTimestamp if date changes
        if (fields.publishedDate !== undefined) {
            patches.publishedTimestamp = parsePublishedDate(fields.publishedDate)?.getTime() ?? Date.now();
        }

        if (fields.sentiment !== undefined && fields.sentiment !== existing.sentiment) {
            patches.manualSentimentOverride = true;
            patches.originalSentiment = existing.manualSentimentOverride 
                ? (existing.originalSentiment ?? existing.sentiment) 
                : existing.sentiment;
        }

        await ctx.db.patch(id, patches);
    },
});

// 4. MUTATION: Delete ALL articles (clear report) - batched to prevent timeouts/OCC
export const deleteAllArticles = mutation({
    args: {
        cursor: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const batchSize = 200;
        const articles = await ctx.db
            .query("media_monitoring_articles")
            .take(batchSize);

        const currentDeleted = args.cursor ?? 0;
        const count = articles.length;

        await Promise.all(articles.map((article) => ctx.db.delete(article._id)));

        const totalDeleted = currentDeleted + count;

        if (count === batchSize) {
            await ctx.scheduler.runAfter(0, api.monitoring.deleteAllArticles, {
                cursor: totalDeleted,
            });
        }

        return { deleted: totalDeleted };
    },
});

// 5. MUTATION: Delete multiple articles (atomic Promise.all)
export const deleteArticles = mutation({
    args: { ids: v.array(v.id("media_monitoring_articles")) },
    handler: async (ctx, args) => {
        await Promise.all(args.ids.map((id) => ctx.db.delete(id)));
        return { deleted: args.ids.length };
    },
});

// 5.5 MUTATION: Update article sentiment (manual override)
export const updateSentiment = mutation({
    args: {
        id: v.id("media_monitoring_articles"),
        sentiment: sentimentValidator,
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new ConvexError("ArticleNotFound: Article not found");

        await ctx.db.patch(args.id, {
            sentiment: args.sentiment,
            manualSentimentOverride: true,
            originalSentiment: existing.manualSentimentOverride ? (existing.originalSentiment ?? existing.sentiment) : existing.sentiment,
        });
    },
});

// 5.6 MUTATION: Update keyword - batched & self-rescheduled
export const updateKeyword = mutation({
    args: { oldKeyword: v.string(), newKeyword: v.string() },
    handler: async (ctx, args) => {
        const batchSize = 100;
        const articles = await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_keyword_and_createdAt", (q) => q.eq("keyword", args.oldKeyword))
            .take(batchSize);

        for (const article of articles) {
            await ctx.db.patch(article._id, { keyword: args.newKeyword });
        }

        if (articles.length === batchSize) {
            await ctx.scheduler.runAfter(0, api.monitoring.updateKeyword, {
                oldKeyword: args.oldKeyword,
                newKeyword: args.newKeyword,
            });
        }
    }
});

// QUERY: Retrieve articles created after a specific timestamp, sorted oldest to newest
export const getArticlesSince = query({
    args: {
        since: v.number(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;
        return await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_createdAt", (q) => q.gt("createdAt", args.since))
            .order("asc")
            .take(limit);
    },
});
