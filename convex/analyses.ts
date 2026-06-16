/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

import { query } from "./_generated/server";

export const saveAnalysis = mutation({
    args: {
        inputText: v.string(),
        sentiment: v.string(),
        score: v.number(),
        risk: v.string(),
        riskScore: v.optional(v.number()),
        tone: v.string(),
        emotions: v.optional(v.any()),
        topics: v.optional(v.array(v.string())),
        entities: v.optional(v.array(v.string())),
        recommendation: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("free_analyses", {
            ...args,
            timestamp: Date.now(),
            status: "completed",
        });
        return { id, ...args };
    },
});

export const createAnalysisPending = mutation({
    args: {
        inputText: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("free_analyses", {
            inputText: args.inputText,
            sentiment: "Neutral",
            score: 50,
            risk: "Medium",
            riskScore: 50,
            tone: "Analytical",
            recommendation: "Analysis in progress...",
            timestamp: Date.now(),
            status: "pending",
        });
        return id;
    },
});

export const updateAnalysisAfterAnalysis = mutation({
    args: {
        id: v.id("free_analyses"),
        sentiment: v.string(),
        score: v.number(),
        risk: v.string(),
        riskScore: v.optional(v.number()),
        tone: v.string(),
        emotions: v.optional(v.any()),
        topics: v.optional(v.array(v.string())),
        entities: v.optional(v.array(v.string())),
        recommendation: v.string(),
        status: v.union(v.literal("completed"), v.literal("failed")),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

export const getAnalysis = query({
    args: { id: v.id("free_analyses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});
