/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation, query, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// --- Internal version for background jobs (Crons/Actions) ---
export const insertInternal = internalMutation({
    args: {
        query: v.string(),
        source_type: v.union(v.literal("ahmia"), v.literal("diffbot"), v.literal("zenrows")),
        url: v.string(),
        title: v.string(),
        snippet: v.string(),
        risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        country_origin: v.optional(v.string()),
        summary: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        user_id: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("darkweb_results", {
            ...args,
            discovered_at: Date.now(),
        });
    },
});

export const insertManyInternal = internalMutation({
    args: {
        results: v.array(v.object({
            query: v.string(),
            source_type: v.union(v.literal("ahmia"), v.literal("diffbot"), v.literal("zenrows")),
            url: v.string(),
            title: v.string(),
            snippet: v.string(),
            risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
            country_origin: v.optional(v.string()),
            summary: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
        })),
        user_id: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const inserts = args.results.map(res => 
            ctx.db.insert("darkweb_results", {
                ...res,
                user_id: args.user_id,
                discovered_at: now,
            })
        );
        return await Promise.all(inserts);
    }
});

// â”€â”€â”€ Save a new Dark Web result (Public API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const insert = mutation({
    args: {
        query: v.string(),
        source_type: v.union(v.literal("ahmia"), v.literal("diffbot"), v.literal("zenrows")),
        url: v.string(),
        title: v.string(),
        snippet: v.string(),
        risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        country_origin: v.optional(v.string()),
        summary: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        return await ctx.db.insert("darkweb_results", {
            ...args,
            user_id: identity.subject,
            discovered_at: Date.now(),
        });
    },
});

export const insertMany = mutation({
    args: {
        results: v.array(v.object({
            query: v.string(),
            source_type: v.union(v.literal("ahmia"), v.literal("diffbot"), v.literal("zenrows")),
            url: v.string(),
            title: v.string(),
            snippet: v.string(),
            risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
            country_origin: v.optional(v.string()),
            summary: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
        }))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        
        const now = Date.now();
        const inserts = args.results.map(res => 
            ctx.db.insert("darkweb_results", {
                ...res,
                user_id: identity.subject,
                discovered_at: now,
            })
        );
        
        return await Promise.all(inserts);
    }
});


// â”€â”€â”€ Fetch recent Dark Web results for the current user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getByUserId = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db.query("darkweb_results")
            .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
            .order("desc")
            .take(args.limit ?? 50);
    },
});

// â”€â”€â”€ Fetch Dark Web results by risk level â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getByRiskLevel = query({
    args: { risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Uses compound index â€” avoids .filter() per Convex query guidelines
        return await ctx.db.query("darkweb_results")
            .withIndex("by_user_id_and_risk_level", (q) =>
                q.eq("user_id", identity.subject).eq("risk_level", args.risk_level)
            )
            .order("desc")
            .take(50);
    },
});

// â”€â”€â”€ Delete a single Dark Web result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const deleteById = mutation({
    args: { id: v.id("darkweb_results") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const result = await ctx.db.get(args.id);
        if (!result) throw new ConvexError("Result not found");
        if (result.user_id !== identity.subject) throw new ConvexError("Not authorized");

        await ctx.db.delete(args.id);
    },
});
