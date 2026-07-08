/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

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
        // Optimize: Use new index by_userId_and_isRead_and_createdAt to fetch only unread notifications,
        // eliminating expensive in-memory scanning.
        return await ctx.db
            .query("notifications")
            .withIndex("by_userId_and_isRead_and_createdAt", (q) => 
                q.eq("userId", userId).eq("isRead", false)
            )
            .order("desc")
            .take(100);
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
