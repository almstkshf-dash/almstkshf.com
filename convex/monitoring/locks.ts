/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation } from "../_generated/server";

// 14. MUTATION: Acquire distributed scraper queue lock
export const acquireQueueLock = mutation({
    args: {},
    handler: async (ctx) => {
        const state = await ctx.db
            .query("scraper_queue_state")
            .withIndex("by_type", (q) => q.eq("type", "global"))
            .first();

        const now = Date.now();
        const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

        if (state) {
            if (state.lockExpiry && now < state.lockExpiry) {
                return false; // Lock is currently held and active
            }
            await ctx.db.patch(state._id, {
                lockAcquiredAt: now,
                lockExpiry: now + LOCK_TIMEOUT,
            });
            return true;
        } else {
            await ctx.db.insert("scraper_queue_state", {
                type: "global",
                lockAcquiredAt: now,
                lockExpiry: now + LOCK_TIMEOUT,
            });
            return true;
        }
    }
});

// 15. MUTATION: Release distributed scraper queue lock
export const releaseQueueLock = mutation({
    args: {},
    handler: async (ctx) => {
        const state = await ctx.db
            .query("scraper_queue_state")
            .withIndex("by_type", (q) => q.eq("type", "global"))
            .first();

        if (state) {
            await ctx.db.patch(state._id, {
                lockAcquiredAt: undefined,
                lockExpiry: undefined,
            });
        }
    }
});
