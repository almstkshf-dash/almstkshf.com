import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. QUERY: Get all articles for the dashboard
export const getArticles = query({
    args: {
        limit: v.optional(v.number()),
        sourceType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles").order("desc");

        if (args.sourceType) {
            // @ts-ignore
            q = q.filter((q) => q.eq(q.field("sourceType"), args.sourceType));
        }

        return await q.take(args.limit || 100);
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
        reach: v.number(),
        ave: v.number(),
        imageUrl: v.optional(v.string()),
        isManual: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // Check for duplicates before inserting
        const existing = await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_date", (q) => q.eq("publishedDate", args.publishedDate))
            .filter((q) => q.eq(q.field("title"), args.title))
            .first();

        if (!existing) {
            await ctx.db.insert("media_monitoring_articles", {
                ...args,
                createdAt: Date.now(),
                sourceType: args.sourceType as any,
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
