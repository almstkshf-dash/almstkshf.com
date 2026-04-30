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
        plan: v.optional(v.union(v.literal("standard"), v.literal("professional"), v.literal("enterprise"))),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_subscription_id", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
            .first();

        const isActive = args.status === 'active' || args.status === 'trialing';

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
                userId: args.userId,
                stripeSubscriptionId: args.stripeSubscriptionId,
                stripePriceId: args.stripePriceId,
                stripeCustomerId: args.stripeCustomerId,
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                cancelAtPeriodEnd: args.cancelAtPeriodEnd,
                updatedAt: Date.now(),
            });

            // New subscription: create notification
            await ctx.db.insert("notifications", {
                userId: args.userId,
                title: "Subscription Activated",
                message: `Your ${args.status === 'trialing' ? 'trial' : 'subscription'} is now active. Welcome to the platform!`,
                type: "billing",
                isRead: false,
                createdAt: Date.now(),
            });
        }

        // Update userSettings
        const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (settings) {
            await ctx.db.patch(settings._id, {
                isSubscribed: isActive,
                plan: args.plan,
                isTrialActive: args.status === 'trialing',
                trialEndsAt: args.status === 'trialing' ? args.currentPeriodEnd : undefined,
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

export const checkSubscriptions = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        
        // Find active subscriptions ending in the next 3 days
        const expiringSoon = await ctx.db
            .query("subscriptions")
            .filter((q) => 
                q.and(
                    q.eq(q.field("status"), "active"),
                    q.lt(q.field("currentPeriodEnd"), now + threeDaysMs),
                    q.gt(q.field("currentPeriodEnd"), now)
                )
            )
            .collect();

        for (const sub of expiringSoon) {
            // Check if we already notified them recently (to avoid spam)
            const recentNotif = await ctx.db
                .query("notifications")
                .withIndex("by_userId", (q) => q.eq("userId", sub.userId))
                .filter((q) => 
                    q.and(
                        q.eq(q.field("type"), "billing"),
                        q.eq(q.field("title"), "Subscription Expiring Soon"),
                        q.gt(q.field("createdAt"), now - (24 * 60 * 60 * 1000)) // within last 24h
                    )
                )
                .first();

            if (!recentNotif) {
                await ctx.db.insert("notifications", {
                    userId: sub.userId,
                    title: "Subscription Expiring Soon",
                    message: "Your subscription will expire in less than 3 days. Renew now to keep your access to OSINT and AI Inspector.",
                    type: "billing",
                    isRead: false,
                    createdAt: now,
                });
            }
        }
    },
});
