/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { isValidWebUrl } from "./helpers";
import { languageValidator } from "./validators";

// 1.6. QUERY: Get decoupled RSS live feed articles (cursor-based pagination)
export const getRssArticles = query({
    args: {
        paginationOpts: paginationOptsValidator,
        source: v.optional(v.string()),
        sourceId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.sourceId) {
            return ctx.db
                .query("rss_feed_articles")
                .withIndex("by_sourceId_and_createdAt", (q) => q.eq("sourceId", args.sourceId))
                .order("desc")
                .paginate(args.paginationOpts);
        }
        if (args.source) {
            return ctx.db
                .query("rss_feed_articles")
                .withIndex("by_source_and_createdAt", (q) => q.eq("source", args.source))
                .order("desc")
                .paginate(args.paginationOpts);
        }
        return ctx.db
                .query("rss_feed_articles")
                .withIndex("by_createdAt")
                .order("desc")
                .paginate(args.paginationOpts);
    },
});

// 2.5. MUTATION: Save a single RSS feed article
export const saveRssArticle = mutation({
    args: {
        url: v.string(),
        title: v.string(),
        content: v.string(),
        publishedDate: v.string(),
        language: languageValidator,
        source: v.optional(v.string()),
        sourceId: v.optional(v.string()),
        sourceCountry: v.string(),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Security: Prevent unsafe protocols (javascript:, ftp:, data:)
        if (!isValidWebUrl(args.url)) {
            throw new ConvexError("InvalidURL: The RSS article URL protocol scheme is not supported.");
        }

        // Check if article with the same url exists
        const existing = await ctx.db
            .query("rss_feed_articles")
            .withIndex("by_url", (q) => q.eq("url", args.url))
            .first();

        if (existing) {
            return existing._id;
        }

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

        const id = await ctx.db.insert("rss_feed_articles", {
            ...args,
            sourceId: resolvedSourceId,
            createdAt: Date.now(),
        });
        return id;
    },
});

// 2.6. MUTATION: Schedule a background RSS feed sync
export const scheduleRssSync = mutation({
    args: {
        url: v.string(),
        publisher: v.string(),
        country: v.optional(v.string()),
        lang: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!isValidWebUrl(args.url)) {
            throw new ConvexError("InvalidURL: The RSS feed URL protocol scheme is not supported.");
        }

        await ctx.scheduler.runAfter(0, internal.monitoringAction.syncSpecificRssFeedBackground, {
            feedUrl: args.url,
            publisher: args.publisher,
            country: args.country,
            lang: args.lang,
            limit: args.limit,
        });
        return { success: true };
    },
});
