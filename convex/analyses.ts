/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
        });
        return { id, ...args };
    },
});
