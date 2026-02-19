import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db
            .query("app_settings")
            .filter((q) => q.eq(q.field("type"), "global"))
            .first();

        return settings;
    },
});

export const updateSettings = mutation({
    args: {
        logoUrl: v.optional(v.string()),
        apiKeys: v.object({
            gemini: v.optional(v.string()),
            instagram: v.optional(v.string()),
            twitter: v.optional(v.string()),
            twitterBearer: v.optional(v.string()),
            twitterConsumerKey: v.optional(v.string()),
            twitterConsumerSecret: v.optional(v.string()),
            newsdata: v.optional(v.string()),
            newsapi: v.optional(v.string()),
            gnews: v.optional(v.string()),
            worldnews: v.optional(v.string()),
            phylloClientId: v.optional(v.string()),
            phylloClientSecret: v.optional(v.string()),
            chatbaseId: v.optional(v.string()),
            chatbaseHost: v.optional(v.string()),
            stripePublishableKey: v.optional(v.string()),
            stripeSecretKey: v.optional(v.string()),
            stripeWebhookSecret: v.optional(v.string()),
        }),
        defaults: v.object({
            targetCountries: v.array(v.string()),
            aveMultiplier: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("app_settings")
            .filter((q) => q.eq(q.field("type"), "global"))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, args);
        } else {
            await ctx.db.insert("app_settings", {
                type: "global",
                ...args,
            });
        }
    },
});
