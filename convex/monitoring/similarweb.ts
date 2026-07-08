/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// 11. QUERY: Get cached SimilarWeb domain traffic
export const getCachedDomainTraffic = query({
    args: { domain: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("similarweb_domain_traffic")
            .withIndex("by_domain", (q) => q.eq("domain", args.domain))
            .first();
    },
});

// 12. MUTATION: Save or update cached SimilarWeb domain traffic
export const saveCachedDomainTraffic = mutation({
    args: {
        domain: v.string(),
        monthlyVisits: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("similarweb_domain_traffic")
            .withIndex("by_domain", (q) => q.eq("domain", args.domain))
            .first();

        const timestamp = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, {
                monthlyVisits: args.monthlyVisits,
                lastFetchedAt: timestamp,
            });
        } else {
            await ctx.db.insert("similarweb_domain_traffic", {
                domain: args.domain,
                monthlyVisits: args.monthlyVisits,
                lastFetchedAt: timestamp,
            });
        }
    },
});
