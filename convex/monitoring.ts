import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./utils/auth";

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

        if (args.sourceType && args.sourceType !== "All") {
            // @ts-ignore
            q = q.filter((q) => q.eq(q.field("sourceType"), args.sourceType));
        }

        if (args.sourceCountry && args.sourceCountry !== "All") {
            // @ts-ignore
            q = q.filter((q) => q.eq(q.field("sourceCountry"), args.sourceCountry));
        }
        if (args.depth && args.depth !== "All") {
            // @ts-ignore
            q = q.filter((q) => q.eq(q.field("depth"), args.depth));
        }

        const all = await q.collect();

        const parseDate = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10));
            return new Date(yyyy || 0, (mm || 1) - 1, dd || 1).getTime();
        };

        all.sort((a: any, b: any) => {
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
        sourceType: v.string(),
        sourceCountry: v.string(),
        source: v.optional(v.string()),
        depth: v.optional(v.string()),
        ingestMethod: v.optional(v.string()),
        tone: v.optional(v.string()),
        risk: v.optional(v.string()),
        reach: v.number(),
        ave: v.number(),
        imageUrl: v.optional(v.string()),
        isManual: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx.auth);
        // Ensure sourceType matches schema validator
        const validSourceTypes = ["Online News", "Social Media", "Blog", "Print", "Press Release"];
        const sourceType = validSourceTypes.includes(args.sourceType)
            ? args.sourceType
            : "Online News";

        // Check for duplicates before inserting
        const existing = await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_date", (q) => q.eq("publishedDate", args.publishedDate))
            .filter((q) => q.eq(q.field("title"), args.title))
            .first();

        // 100% Data Validation: Ensure all literals are correct
        const finalSourceType = validSourceTypes.includes(args.sourceType)
            ? (args.sourceType as "Online News" | "Social Media" | "Blog" | "Print" | "Press Release")
            : "Online News";

        if (!existing) {
            await ctx.db.insert("media_monitoring_articles", {
                ...args,
                createdAt: Date.now(),
                sourceType: finalSourceType,
                depth: args.depth ?? "standard",
                ingestMethod: args.ingestMethod,
            });
        }
    },
});

// 3. MUTATION: Delete a single article
export const deleteArticle = mutation({
    args: { id: v.id("media_monitoring_articles") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx.auth);
        await ctx.db.delete(args.id);
    },
});

// 4. MUTATION: Delete ALL articles (clear report)
export const deleteAllArticles = mutation({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx.auth);
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
        await requireAdmin(ctx.auth);
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
        return { deleted: args.ids.length };
    },
});
// 6. QUERY: Get Analytics Overview (NSS, Risk Score, etc.)
export const getAnalyticsOverview = query({
    args: {
        keyword: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const articles = args.keyword
            ? await ctx.db.query("media_monitoring_articles").filter(q => q.eq(q.field("keyword"), args.keyword)).collect()
            : await ctx.db.query("media_monitoring_articles").collect();

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

        // NSS = (Σ Weighted Sentiment) / Total Mentions * 100
        const nss = Math.round((weightedSentimentSum / articles.length) * 100);

        // Risk Score Composition
        const negativeDensity = counts.Negative / articles.length;
        // Mocking Velocity for now — normally would compare with past 24h
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

        return {
            nss,
            riskScore,
            velocity,
            totalReach,
            sentimentDistribution,
            crisisProbability: Math.min(100, Math.round(riskScore * 1.2)),
            count: articles.length,
        };
    },
});
// 7. QUERY: Get Emotion Aggregates
export const getEmotionAggregates = query({
    args: {},
    handler: async (ctx) => {
        const analyses = await ctx.db.query("free_analyses").collect();
        const emotions: Record<string, number> = { joy: 0, anger: 0, sadness: 0, fear: 0, disgust: 0, surprise: 0, trust: 0, anticipation: 0 };
        let count = 0;

        analyses.forEach(a => {
            if (a.emotions) {
                count++;
                Object.entries(a.emotions).forEach(([k, v]) => {
                    if (emotions[k] !== undefined) emotions[k] += (v as number);
                });
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
    args: {},
    handler: async (ctx) => {
        const articles = await ctx.db.query("media_monitoring_articles").collect();
        const countries: Record<string, number> = {};

        articles.forEach(a => {
            countries[a.sourceCountry] = (countries[a.sourceCountry] || 0) + 1;
        });

        return countries;
    },
});
