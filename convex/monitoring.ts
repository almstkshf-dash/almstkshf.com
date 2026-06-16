/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";

function applyMonitoringFilters(q: any, args: { sourceType?: string; sourceCountry?: string; depth?: string }) {
    if (args.sourceType && args.sourceType !== "All") {
        q = q.filter((q: any) => q.eq(q.field("sourceType"), args.sourceType));
    }
    if (args.sourceCountry && args.sourceCountry !== "All") {
        q = q.filter((q: any) => q.eq(q.field("sourceCountry"), args.sourceCountry));
    }
    if (args.depth && args.depth !== "All") {
        q = q.filter((q: any) => q.eq(q.field("depth"), args.depth));
    }
    return q;
}

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

        let q = ctx.db.query("media_monitoring_articles");
        q = applyMonitoringFilters(q, args);
        const all = await q.collect();

        const parseDate = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10));
            return new Date(yyyy || 0, (mm || 1) - 1, dd || 1).getTime();
        };

        all.sort((a, b) => {
            const da = parseDate(a.publishedDate);
            const db = parseDate(b.publishedDate);
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
        const existing = await ctx.db
            .query("media_monitoring_articles")
            .filter((q) => q.eq(q.field("url"), args.url))
            .first();
        return !!existing;
    },
});

// 1.6. QUERY: Get decoupled RSS live feed articles
export const getRssArticles = query({
    args: {
        limit: v.optional(v.number()),
        skip: v.optional(v.number()),
        source: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 100;
        const skip = args.skip ?? 0;

        let queryBuilder = ctx.db.query("rss_feed_articles");
        if (args.source) {
            queryBuilder = queryBuilder.filter((q) => q.eq(q.field("source"), args.source));
        }
        const all = await queryBuilder.collect();

        const parseDate = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10));
            return new Date(yyyy || 0, (mm || 1) - 1, dd || 1).getTime();
        };

        all.sort((a, b) => {
            const da = parseDate(a.publishedDate);
            const db = parseDate(b.publishedDate);
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

// 2.5. MUTATION: Save a single RSS feed article
export const saveRssArticle = mutation({
    args: {
        url: v.string(),
        title: v.string(),
        content: v.string(),
        publishedDate: v.string(),
        language: v.union(v.literal("EN"), v.literal("AR")),
        source: v.optional(v.string()),
        sourceCountry: v.string(),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if article with the same url exists
        const existing = await ctx.db
            .query("rss_feed_articles")
            .withIndex("by_url", (q) => q.eq("url", args.url))
            .first();

        if (existing) {
            return existing._id;
        }

        const id = await ctx.db.insert("rss_feed_articles", {
            ...args,
            createdAt: Date.now(),
        });
        return id;
    },
});

// 2. MUTATION: Save a single article (called by the Action below)
export const saveArticle = mutation({
    args: {
        keyword: v.string(),
        url: v.string(),
        resolvedUrl: v.optional(v.string()),
        publishedDate: v.string(),
        title: v.string(),
        content: v.string(),
        language: v.union(v.literal("EN"), v.literal("AR")),
        sentiment: v.union(v.literal("Positive"), v.literal("Neutral"), v.literal("Negative")),
        sourceType: v.union(
            v.literal("Online News"),
            v.literal("Social Media"),
            v.literal("Blog"),
            v.literal("Print"),
            v.literal("Press Release")
        ),
        sourceCountry: v.string(),
        source: v.optional(v.string()),
        depth: v.optional(v.union(v.literal("standard"), v.literal("deep"))),
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
        emotions: v.optional(v.object({
            joy: v.number(),
            sadness: v.number(),
            anger: v.number(),
            fear: v.number(),
            surprise: v.number(),
            trust: v.number(),
        })),
        analysisStatus: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
    },
    handler: async (ctx, args) => {
        try {
            // Ensure sourceType matches schema validator
            const validSourceTypes = ["Online News", "Social Media", "Blog", "Print", "Press Release"];

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

            // 100% Data Validation: Ensure all literals are correct
            const finalSourceType = validSourceTypes.includes(args.sourceType)
                ? (args.sourceType as "Online News" | "Social Media" | "Blog" | "Print" | "Press Release")
                : "Online News";

            const id = await ctx.db.insert("media_monitoring_articles", {
                ...args,
                createdAt: Date.now(),
                sourceType: finalSourceType,
                depth: (args.depth ?? "standard") as "standard" | "deep",
                ingestMethod: args.ingestMethod,
                manualSentimentOverride: args.manualSentimentOverride ?? false,
                originalSentiment: args.originalSentiment ?? args.sentiment,
                relevancy_score: args.relevancy_score,
                hashtags: args.hashtags,
                emotions: args.emotions,
            });

            if (args.analysisStatus === "pending") {
                await ctx.scheduler.runAfter(0, internal.monitoringAction.analyzeArticleBackground, {
                    articleId: id,
                });
            }
            return id;
        } catch (error) {
            console.error("saveArticle failed. Args:", JSON.stringify(args));
            console.error("saveArticle error:", error);
            throw error;
        }
    },
});

// MUTATION: Update article after background analysis completes
export const updateArticleAfterAnalysis = mutation({
    args: {
        id: v.id("media_monitoring_articles"),
        sentiment: v.union(v.literal("Positive"), v.literal("Neutral"), v.literal("Negative")),
        analysisStatus: v.union(v.literal("completed"), v.literal("failed")),
        tone: v.optional(v.string()),
        risk: v.optional(v.string()),
        reach: v.number(),
        ave: v.number(),
        relevancy_score: v.optional(v.number()),
        emotions: v.optional(v.object({
            joy: v.number(),
            sadness: v.number(),
            anger: v.number(),
            fear: v.number(),
            surprise: v.number(),
            trust: v.number(),
        })),
        sourceCountry: v.optional(v.string()),
        source: v.optional(v.string()),
        resolvedUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        content: v.optional(v.string()),
        depth: v.optional(v.union(v.literal("standard"), v.literal("deep"))),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Article not found");
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
        language: v.optional(v.union(v.literal("EN"), v.literal("AR"))),
        sentiment: v.optional(v.union(v.literal("Positive"), v.literal("Neutral"), v.literal("Negative"))),
        sourceType: v.optional(v.union(
            v.literal("Online News"),
            v.literal("Social Media"),
            v.literal("Blog"),
            v.literal("Print"),
            v.literal("Press Release")
        )),
        sourceCountry: v.optional(v.string()),
        source: v.optional(v.string()),
        depth: v.optional(v.union(v.literal("standard"), v.literal("deep"))),
        reach: v.optional(v.number()),
        ave: v.optional(v.number()),
        imageUrl: v.optional(v.string()),
        likes: v.optional(v.number()),
        retweets: v.optional(v.number()),
        replies: v.optional(v.number()),
        publisherUsername: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Article not found");
        await ctx.db.patch(id, fields);
    },
});


export const createNotification = mutation({
    args: {
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("alert"), v.literal("system"), v.literal("billing")),
    },
    handler: async (ctx, args) => {
        const ident = await ctx.auth.getUserIdentity();
        if (!ident) {
            // Silently skip if user is not authenticated (e.g., called from system context)
            return;
        }

        const userId = ident.subject;
        await ctx.db.insert("notifications", {
            userId,
            title: args.title,
            message: args.message,
            type: args.type,
            isRead: false,
            createdAt: Date.now(),
        });
    }
});
export const getUnreadNotifications = query({
    args: {},
    handler: async (ctx) => {
        const ident = await ctx.auth.getUserIdentity();
        if (!ident) return [];

        const userId = ident.subject;
        // Use the simpler by_userId index and filter isRead in-memory to avoid
        // any compound index data integrity issues on the production deployment
        const allUserNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .take(200);

        return allUserNotifications.filter((n) => !n.isRead).slice(0, 100);
    }
});
export const markNotificationAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const ident = await ctx.auth.getUserIdentity();
        if (!ident) return;

        const notif = await ctx.db.get(args.id);
        if (notif && notif.userId === ident.subject) {
            await ctx.db.patch(args.id, { isRead: true });
        }
    }
});

// 4. MUTATION: Delete ALL articles (clear report)
export const deleteAllArticles = mutation({
    args: {},
    handler: async (ctx) => {
        const articles = await ctx.db
            .query("media_monitoring_articles")
            .collect();
        for (const article of articles) {
            await ctx.db.delete(article._id);
        }
        return { deleted: articles.length };
    },
});
// 5. MUTATION: Delete multiple articles
export const deleteArticles = mutation({
    args: { ids: v.array(v.id("media_monitoring_articles")) },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
        return { deleted: args.ids.length };
    },
});

// 5.5 MUTATION: Update article sentiment (manual override)
export const updateSentiment = mutation({
    args: {
        id: v.id("media_monitoring_articles"),
        sentiment: v.union(v.literal("Positive"), v.literal("Neutral"), v.literal("Negative")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Article not found");

        await ctx.db.patch(args.id, {
            sentiment: args.sentiment,
            manualSentimentOverride: true,
            originalSentiment: existing.manualSentimentOverride ? (existing.originalSentiment ?? existing.sentiment) : existing.sentiment,
        });
    },
});

// 5.6 MUTATION: Update keyword (used on dashboard)
export const updateKeyword = mutation({
    args: { oldKeyword: v.string(), newKeyword: v.string() },
    handler: async (ctx, args) => {
        const articles = await ctx.db.query("media_monitoring_articles")
            .filter(q => q.eq(q.field("keyword"), args.oldKeyword))
            .collect();
        for (const article of articles) {
            await ctx.db.patch(article._id, { keyword: args.newKeyword });
        }
    }
});
// 6. QUERY: Get Analytics Overview (NSS, Risk Score, etc.)
export const getAnalyticsOverview = query({
    args: {
        keyword: v.optional(v.string()),
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles");
        q = applyMonitoringFilters(q, args);
        if (args.keyword) {
            q = q.filter((q: any) => q.eq(q.field("keyword"), args.keyword));
        }
        const articles = await q.collect();

        if (articles.length === 0) {
            return {
                nss: 0,
                riskScore: 0,
                velocity: 0,
                totalReach: 0,
                sentimentDistribution: { Positive: 0, Neutral: 0, Negative: 0 },
                crisisProbability: 0,
            };
        }

        const counts = { Positive: 0, Neutral: 0, Negative: 0 };
        let totalReach = 0;
        let weightedSentimentSum = 0;

        articles.forEach(a => {
            counts[a.sentiment]++;
            totalReach += a.reach || 0;

            // NSS Calculation logic
            // Weight: Log(Reach + 1) as influence proxy
            const weight = Math.log10((a.reach || 0) + 1) || 1;
            const sentimentValue = a.sentiment === "Positive" ? 1 : a.sentiment === "Negative" ? -1 : 0;
            weightedSentimentSum += sentimentValue * weight;
        });

        // NSS = (Î£ Weighted Sentiment) / Total Mentions * 100
        const nss = Math.round((weightedSentimentSum / articles.length) * 100);

        // Risk Score Composition
        const negativeDensity = counts.Negative / articles.length;
        // Mocking Velocity for now â€” normally would compare with past 24h
        const velocity = 0.05;
        const influencerNegativeWeight = 0.1; // Placeholder
        const topicSensitivity = 0.2; // Placeholder

        const riskScoreRaw = (negativeDensity * 0.4) + (velocity * 0.2) + (influencerNegativeWeight * 0.2) + (topicSensitivity * 0.2);
        const riskScore = Math.round(riskScoreRaw * 100);

        const sentimentDistribution = {
            Positive: Math.round((counts.Positive / articles.length) * 100),
            Neutral: Math.round((counts.Neutral / articles.length) * 100),
            Negative: Math.round((counts.Negative / articles.length) * 100),
        };

        // Identify Risk Factors
        const riskFactors: string[] = [];
        if (nss < -10) riskFactors.push("negative_sentiment_tilt");
        if (sentimentDistribution.Negative > 30) riskFactors.push("high_negative_volume");
        if (totalReach > 1000000 && nss < 0) riskFactors.push("viral_negative_reach");

        return {
            nss,
            riskScore,
            velocity,
            totalReach,
            sentimentDistribution,
            crisisProbability: Math.min(100, Math.round(riskScore * 1.2)),
            count: articles.length,
            riskFactors,
        };
    },
});
// 7. QUERY: Get Emotion Aggregates
export const getEmotionAggregates = query({
    args: {
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles");
        q = applyMonitoringFilters(q, args);
        const articles = await q.collect();
        const emotions: Record<string, number> = { joy: 0, anger: 0, sadness: 0, fear: 0, disgust: 0, surprise: 0, trust: 0, anticipation: 0 };
        let count = 0;

        articles.forEach(a => {
            // Priority 1: Dedicated emotions field
            if (a.emotions) {
                count++;
                Object.entries(a.emotions).forEach(([k, v]) => {
                    if (emotions[k] !== undefined) emotions[k] += (v as number);
                });
            }
            // Priority 2: Legacy tone field (if it's a JSON string containing emotions)
            else if (a.tone) {
                try {
                    const parsedTone = JSON.parse(a.tone);
                    if (parsedTone.emotions) {
                        count++;
                        Object.entries(parsedTone.emotions).forEach(([k, v]) => {
                            if (emotions[k] !== undefined) emotions[k] += (v as number);
                        });
                    }
                } catch (err) { /* skip unparseable tone */ }
            }
        });

        if (count > 0) {
            Object.keys(emotions).forEach(k => emotions[k] = parseFloat((emotions[k] / count).toFixed(2)));
        }

        return emotions;
    },
});

// 8. QUERY: Get Geography Aggregates
export const getGeographyAggregates = query({
    args: {
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles");
        q = applyMonitoringFilters(q, args);
        const articles = await q.collect();
        const countries: Record<string, number> = {};

        articles.forEach(a => {
            countries[a.sourceCountry] = (countries[a.sourceCountry] || 0) + 1;
        });

        return countries;
    },
});

// 9. QUERY: Get Press Release Online News Reports
export const getPressReleaseOnlineNewsReports = query({
    args: { keyword: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles")
            .filter(q => q.eq(q.field("sourceType"), "Press Release"));

        if (args.keyword) {
            q = q.filter(q => q.eq(q.field("keyword"), args.keyword));
        }

        const articles = await q.collect();

        const parseDate = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10));
            return new Date(yyyy || 0, (mm || 1) - 1, dd || 1).getTime();
        };

        // Sort by publishedDate desc
        articles.sort((a, b) => {
            const da = parseDate(a.publishedDate);
            const db = parseDate(b.publishedDate);
            return db - da;
        });

        return articles.map((article, index) => ({
            No: index + 1,
            URL: article.url,
            "Published Date": article.publishedDate,
            Title: article.title,
            Content: article.content,
            Language: article.language,
            Sentiment: article.sentiment,
            "Source Type": article.sourceType,
            "Source Country": article.sourceCountry,
            Reach: article.reach,
            AVE: article.ave,
        }));
    },
});

// 10. QUERY: Get Press Release Social Media Reports
export const getPressReleaseSocialMediaReports = query({
    args: { keyword: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles")
            .filter(q => q.eq(q.field("sourceType"), "Social Media"));

        if (args.keyword) {
            q = q.filter(q => q.eq(q.field("keyword"), args.keyword));
        }

        const articles = await q.collect();

        const parseDate = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10));
            return new Date(yyyy || 0, (mm || 1) - 1, dd || 1).getTime();
        };

        // Sort by publishedDate desc
        articles.sort((a, b) => {
            const da = parseDate(a.publishedDate);
            const db = parseDate(b.publishedDate);
            return db - da;
        });

        return articles.map((article, index) => ({
            No: index + 1,
            URL: article.url,
            "Published Date": article.publishedDate,
            Title: article.title,
            Content: article.content,
            Language: article.language,
            Sentiment: article.sentiment,
            source_type: article.sourceType,
            "Source.country": article.sourceCountry,
            Reach: article.reach,
            AVE: article.ave,
        }));
    },
});

// 11. QUERY: Get cached SimilarWeb domain traffic
export const getCachedDomainTraffic = query({
    args: { domain: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("similarweb_domain_traffic")
            .withIndex("by_domain", (q) => q.eq("domain", args.domain))
            .first();
    },
});

// 12. MUTATION: Save or update cached SimilarWeb domain traffic
export const saveCachedDomainTraffic = mutation({
    args: {
        domain: v.string(),
        monthlyVisits: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("similarweb_domain_traffic")
            .withIndex("by_domain", (q) => q.eq("domain", args.domain))
            .first();

        const timestamp = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, {
                monthlyVisits: args.monthlyVisits,
                lastFetchedAt: timestamp,
            });
        } else {
            await ctx.db.insert("similarweb_domain_traffic", {
                domain: args.domain,
                monthlyVisits: args.monthlyVisits,
                lastFetchedAt: timestamp,
            });
        }
    },
});

// 13. MUTATION: Purge old data to reduce Convex database usage and document count
export const purgeOldData = mutation({
    args: {},
    handler: async (ctx) => {
        let totalDeleted = 0;

        // 1. Purge old RSS feed articles (Keep only the latest 2000)
        const rssLimitCheck = await ctx.db
            .query("rss_feed_articles")
            .withIndex("by_createdAt")
            .order("desc")
            .take(2001);
        
        if (rssLimitCheck.length > 2000) {
            const cutoffTime = rssLimitCheck[2000].createdAt;
            const toDelete = await ctx.db
                .query("rss_feed_articles")
                .withIndex("by_createdAt", (q) => q.lte("createdAt", cutoffTime))
                .take(200); // Process in batches of 200 to avoid long transactions
            for (const doc of toDelete) {
                await ctx.db.delete(doc._id);
                totalDeleted++;
            }
        }

        // 2. Purge old OSINT results (older than 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const oldOsint = await ctx.db
            .query("osint_results")
            .withIndex("by_created_at", (q) => q.lt("createdAt", sevenDaysAgo))
            .take(200);
        for (const doc of oldOsint) {
            await ctx.db.delete(doc._id);
            totalDeleted++;
        }

        // 3. Purge old Dark Web results (older than 7 days)
        const oldDarkweb = await ctx.db
            .query("darkweb_results")
            .withIndex("by_discovered_at", (q) => q.lt("discovered_at", sevenDaysAgo))
            .take(200);
        for (const doc of oldDarkweb) {
            await ctx.db.delete(doc._id);
            totalDeleted++;
        }

        // 4. Purge old free analyses (older than 7 days)
        const oldAnalyses = await ctx.db
            .query("free_analyses")
            .withIndex("by_timestamp", (q) => q.lt("timestamp", sevenDaysAgo))
            .take(200);
        for (const doc of oldAnalyses) {
            await ctx.db.delete(doc._id);
            totalDeleted++;
        }

        // 5. Purge old media monitoring articles (older than 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const oldMonitoring = await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_createdAt", (q) => q.lt("createdAt", thirtyDaysAgo))
            .take(200);
        for (const doc of oldMonitoring) {
            await ctx.db.delete(doc._id);
            totalDeleted++;
        }

        return { success: true, deletedCount: totalDeleted };
    },
});

