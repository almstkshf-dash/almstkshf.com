import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordPayment = mutation({
    args: {
        stripeSessionId: v.string(),
        userId: v.optional(v.string()),
        amount: v.number(),
        currency: v.string(),
        status: v.string(),
        productName: v.string(),
        customerEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("payments")
            .withIndex("by_session_id", (q) => q.eq("stripeSessionId", args.stripeSessionId))
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, {
                status: args.status,
            });
        }

        return await ctx.db.insert("payments", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

export const getUserPayments = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("payments")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});
