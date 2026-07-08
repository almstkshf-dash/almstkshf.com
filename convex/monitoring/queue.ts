/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { queueStatusValidator } from "./validators";

// 16. MUTATION: Atomically claim pending queue items and clean up timed-out items
export const getPendingQueueBatch = mutation({
    args: { limit: v.number() },
    handler: async (ctx, args) => {
        // Reset timed-out processing items (older than 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        // Optimize: Use the new by_status_and_updatedAt index to fetch ONLY the items
        // that are actually timed out, avoiding loading the entire processing set.
        const timedOutItems = await ctx.db
            .query("scraper_queue")
            .withIndex("by_status_and_updatedAt", (q) => 
                q.eq("status", "processing").lt("updatedAt", fiveMinutesAgo)
            )
            .take(100);

        for (const item of timedOutItems) {
            const newRetryCount = item.retryCount + 1;
            const newStatus = newRetryCount >= 3 ? "failed" : "pending";
            await ctx.db.patch(item._id, {
                status: newStatus,
                retryCount: newRetryCount,
                error: "Task timed out during processing (exceeded 5 minutes)",
                updatedAt: Date.now(),
            });
        }

        // Fetch pending items
        const pendingItems = await ctx.db
            .query("scraper_queue")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", "pending"))
            .order("asc")
            .take(args.limit);

        // Atomic claim: Mark items as processing immediately within this transaction
        const now = Date.now();
        for (const item of pendingItems) {
            await ctx.db.patch(item._id, {
                status: "processing",
                updatedAt: now,
            });
        }

        // Return the claimed items
        return pendingItems.map((item) => ({
            ...item,
            status: "processing" as const,
            updatedAt: now,
        }));
    }
});

// 17. MUTATION: Update the status of a queue item
export const updateQueueItemStatus = mutation({
    args: {
        id: v.id("scraper_queue"),
        status: queueStatusValidator,
        retryCount: v.optional(v.number()),
        error: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, {
            ...fields,
            updatedAt: Date.now()
        });
    }
});
