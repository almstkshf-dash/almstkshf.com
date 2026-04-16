/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCaseStudies = query({
    args: { category: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const q = ctx.db.query("case_studies");
        if (args.category) {
            return await q.filter((q) => q.eq(q.field("category"), args.category)).collect();
        }
        return await q.collect();
    },
});

export const addCaseStudy = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.string(),
        imageUrl: v.optional(v.string()),
        content: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("case_studies", args);
    },
});
