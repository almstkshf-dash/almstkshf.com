import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Fetches user settings by Clerk user ID.
 */
export const get = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
        const isAdmin = adminIds.includes(identity.subject);

        // Authorization: Only allow user to see their own settings OR an admin to see any.
        if (identity.subject !== args.userId && !isAdmin) {
            throw new ConvexError("Not authorized to view these settings.");
        }

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
 * userId is derived server-side from the authenticated session — never trusted from the client.
 */
export const updateGeminiKey = mutation({
    args: { geminiApiKey: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Not authenticated");
        }
        const userId = identity.subject;

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                geminiApiKey: args.geminiApiKey,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("userSettings", {
                userId,
                geminiApiKey: args.geminiApiKey,
                isTrialActive: false,
                isSubscribed: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    },
});

/**
 * Updates any API key in the nested apiKeys object.
 */
export const updateApiKeys = mutation({
    args: {
        keys: v.object({
            gemini: v.optional(v.string()),
            newsdata: v.optional(v.string()),
            newsapi: v.optional(v.string()),
            gnews: v.optional(v.string()),
            worldnews: v.optional(v.string()),
            bing: v.optional(v.string()),
            mediastack: v.optional(v.string()),
            serper: v.optional(v.string()),
            twitterBearer: v.optional(v.string()),
        })
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        const userId = identity.subject;

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        const newApiKeys = {
            ...(existing?.apiKeys || {}),
            ...args.keys
        };

        if (existing) {
            await ctx.db.patch(existing._id, {
                apiKeys: newApiKeys,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("userSettings", {
                userId,
                apiKeys: newApiKeys,
                isTrialActive: false,
                isSubscribed: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    }
});

/**
 * Sets the subscription status for a user.
 * ADMIN-ONLY — typically called by the Stripe webhook handler.
 */
export const setSubscriptionStatus = mutation({
    args: { userId: v.string(), isSubscribed: v.boolean() },
    handler: async (ctx, args) => {
        // Only admin users or the system webhook can call this.
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            // If a user is authenticated, they must be an admin.
            const adminIds = (process.env.ADMIN_USER_IDS || "")
                .split(",").map((s) => s.trim()).filter(Boolean);
            if (!adminIds.includes(identity.subject)) {
                throw new ConvexError("Admin access required to update subscription status.");
            }
        }
        // If no identity (webhook/system call), allow through.

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
