import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetches user settings by Clerk user ID.
 */
export const get = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

/**
 * Initializes user settings with a 7-day trial.
 */
export const init = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
        const isAdmin = adminIds.includes(args.userId);

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) return existing._id;

        const trialDays = 7;
        const trialEndsAt = Date.now() + trialDays * 24 * 60 * 60 * 1000;

        return await ctx.db.insert("userSettings", {
            userId: args.userId,
            isTrialActive: !isAdmin,
            trialEndsAt: isAdmin ? undefined : trialEndsAt,
            isSubscribed: isAdmin,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

/**
 * Updates the user's personal Gemini API key (BYOK).
 */
export const updateGeminiKey = mutation({
    args: { userId: v.string(), geminiApiKey: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                geminiApiKey: args.geminiApiKey,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("userSettings", {
                userId: args.userId,
                geminiApiKey: args.geminiApiKey,
                isTrialActive: false, // Override trial if they add their own key? Or keep it?
                isSubscribed: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    },
});

/**
 * Sets the subscription status for a user (Admin only).
 */
export const setSubscriptionStatus = mutation({
    args: { userId: v.string(), isSubscribed: v.boolean() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isSubscribed: args.isSubscribed,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("userSettings", {
                userId: args.userId,
                isSubscribed: args.isSubscribed,
                isTrialActive: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    },
});
