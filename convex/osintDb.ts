/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

// No "use node" â€” mutations and queries run on the default Convex runtime.
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getGlobalSettingsInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("app_settings")
            .filter(q => q.eq(q.field("type"), "global"))
            .unique();
    },
});

// --- Internal version for background jobs (Crons/Actions) ---
export const saveOsintResultInternal = internalMutation({
    args: {
        type: v.union(
            v.literal("email"),
            v.literal("domain"),
            v.literal("ip"),
            v.literal("username"),
            v.literal("phone"),
            v.literal("gdelt"),
            v.literal("news"),
            v.literal("corporate"),
            v.literal("location"),
            v.literal("wikipedia"),
            v.literal("gleif"),
            v.literal("watchlist")
        ),
        query: v.string(),
        result: v.any(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("osint_results", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// â”€â”€â”€ Save a new OSINT lookup result (Public API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const saveOsintResult = mutation({
    args: {
        type: v.union(
            v.literal("email"),
            v.literal("domain"),
            v.literal("ip"),
            v.literal("username"),
            v.literal("phone"),
            v.literal("gdelt"),
            v.literal("news"),
            v.literal("corporate"),
            v.literal("location"),
            v.literal("wikipedia"),
            v.literal("gleif"),
            v.literal("watchlist")
        ),
        query: v.string(),
        result: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        return await ctx.db.insert("osint_results", {
            ...args,
            userId: identity.subject,
            createdAt: Date.now(),
        });
    },
});

// â”€â”€â”€ Fetch recent OSINT results for the current user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getOsintResults = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return await ctx.db.query("osint_results")
            .withIndex("by_created_at")
            .order("desc")
            .take(args.limit ?? 50);
    },
});

// â”€â”€â”€ Delete a single OSINT result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const deleteOsintResult = mutation({
    args: { id: v.id("osint_results") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        await ctx.db.delete(args.id);
    },
});
