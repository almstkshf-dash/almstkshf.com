import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


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
    },
    handler: async (ctx, args) => {
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
                depth: (args.depth ?? "standard") as "standard" | "deep",
                ingestMethod: args.ingestMethod,
                manualSentimentOverride: args.manualSentimentOverride ?? false,
                originalSentiment: args.originalSentiment ?? args.sentiment,
                relevancy_score: args.relevancy_score,
                hashtags: args.hashtags,
                emotions: args.emotions,
            });
        }
    },
});

// 3. MUTATION: Delete a single article
export const deleteArticle = mutation({
    args: { id: v.id("media_monitoring_articles") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const createNotification = mutation({
    args: {
        userId: v.string(),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("alert"), v.literal("system"), v.literal("billing")),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            ...args,
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
        return await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isRead"), false))
            .order("desc")
            .collect();
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
    args: {},
    handler: async (ctx) => {
        const articles = await ctx.db.query("media_monitoring_articles").collect();
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
                } catch (e) { /* skip unparseable tone */ }
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
