/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation, query, internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./utils/auth";

export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const settings = await ctx.db
            .query("app_settings")
            .filter((q) => q.eq(q.field("type"), "global"))
            .first();

        if (!settings) return null;

        // Check if user is admin to return sensitive keys
        const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
        const isAdmin = adminIds.includes(identity.subject);

        if (isAdmin) {
            return settings;
        }

        // Return redacted version for non-admins (only public info)
        return {
            _id: settings._id,
            _creationTime: settings._creationTime,
            type: settings.type,
            logoUrl: settings.logoUrl,
            defaults: settings.defaults,
            apiKeys: undefined as any, // Tell TS this property exists but is undefined
        };
    },
});

export const getSystemSettings = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("app_settings")
            .filter((q) => q.eq(q.field("type"), "global"))
            .first();
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
            chatbaseId: v.optional(v.string()),
            chatbaseHost: v.optional(v.string()),
            stripePublishableKey: v.optional(v.string()),
            stripeSecretKey: v.optional(v.string()),
            stripeWebhookSecret: v.optional(v.string()),
            // OSINT keys
            hibp: v.optional(v.string()),
            whoisjson: v.optional(v.string()),
            abuseipdb: v.optional(v.string()),
            numverify: v.optional(v.string()),
            diffbot: v.optional(v.string()),
            zenrows: v.optional(v.string()),
        }),
        defaults: v.object({
            targetCountries: v.array(v.string()),
            aveMultiplier: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        try {
            await requireAdmin(ctx.auth);
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
        } catch (error: any) {
            console.error("Error in updateSettings:", error);
            throw new ConvexError({
                message: error.message || "Failed to update settings",
                code: error.code || "INTERNAL_ERROR",
            });
        }
    },
});
