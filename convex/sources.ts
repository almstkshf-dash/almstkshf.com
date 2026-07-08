/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all registered media sources
export const getSources = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("media_sources").collect();
    },
});

// Get a single source by its ID
export const getSourceById = query({
    args: { sourceId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("media_sources")
            .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
            .unique();
    },
});

// Seed or update sources list from config (typically called by Cron or on-demand sync)
export const seedSources = mutation({
    args: {
        sources: v.array(v.object({
            id: v.string(),
            name: v.string(),
            domain: v.string(),
            country: v.string(),
            languages: v.array(v.string()),
            type: v.union(v.literal("newspaper"), v.literal("agency"), v.literal("blog"), v.literal("government"), v.literal("social")),
            credibilityScore: v.number(),
            tier: v.union(v.literal("premium"), v.literal("standard")),
            isActive: v.optional(v.boolean()),
        }))
    },
    handler: async (ctx, args) => {
        let insertedCount = 0;
        let updatedCount = 0;

        for (const src of args.sources) {
            const existing = await ctx.db
                .query("media_sources")
                .withIndex("by_sourceId", (q) => q.eq("sourceId", src.id))
                .unique();

            const doc = {
                sourceId: src.id,
                name: src.name,
                domain: src.domain,
                country: src.country,
                languages: src.languages,
                type: src.type,
                credibilityScore: src.credibilityScore,
                tier: src.tier,
                isActive: src.isActive ?? true,
            };

            if (existing) {
                // Update if changed
                let hasChanges = false;
                if (existing.name !== doc.name ||
                    existing.domain !== doc.domain ||
                    existing.country !== doc.country ||
                    existing.credibilityScore !== doc.credibilityScore ||
                    existing.tier !== doc.tier ||
                    JSON.stringify(existing.languages) !== JSON.stringify(doc.languages) ||
                    existing.type !== doc.type) {
                    hasChanges = true;
                }
                if (hasChanges) {
                    await ctx.db.patch(existing._id, doc);
                    updatedCount++;
                }
            } else {
                await ctx.db.insert("media_sources", doc);
                insertedCount++;
            }
        }

        return { insertedCount, updatedCount };
    },
});

// Log or update the health status of an RSS source feed
export const updateSourceHealth = mutation({
    args: {
        sourceId: v.string(),
        status: v.union(v.literal("active"), v.literal("slow"), v.literal("failed")),
        responseTimeMs: v.number(),
        articlesFound: v.number(),
        failureMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("media_sources_health")
            .withIndex("by_sourceId", (q) => q.eq("sourceId", args.sourceId))
            .unique();

        const doc = {
            sourceId: args.sourceId,
            lastChecked: Date.now(),
            status: args.status,
            responseTimeMs: args.responseTimeMs,
            articlesFound: args.articlesFound,
            failureMessage: args.failureMessage,
        };

        if (existing) {
            await ctx.db.patch(existing._id, doc);
            return existing._id;
        } else {
            return await ctx.db.insert("media_sources_health", doc);
        }
    },
});

// Get health records for all sources
export const getSourcesHealth = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("media_sources_health").collect();
    },
});
