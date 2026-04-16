/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

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
export const syncSubscription = mutation({
    args: {
        userId: v.string(),
        stripeSubscriptionId: v.string(),
        stripePriceId: v.string(),
        stripeCustomerId: v.string(),
        status: v.string(),
        currentPeriodEnd: v.number(),
        cancelAtPeriodEnd: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_subscription_id", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                status: args.status,
                stripePriceId: args.stripePriceId,
                currentPeriodEnd: args.currentPeriodEnd,
                cancelAtPeriodEnd: args.cancelAtPeriodEnd,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("subscriptions", {
                ...args,
                updatedAt: Date.now(),
            });
        }
    },
});

export const getSubscription = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();
    },
});
