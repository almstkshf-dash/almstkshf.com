/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation } from "../_generated/server";
import { api } from "../_generated/api";

// 13. MUTATION: Purge old data to reduce Convex database usage and document count
// Optimizes cleanup by self-rescheduling until all old records are purged.
export const purgeOldData = mutation({
    args: {},
    handler: async (ctx) => {
        let totalDeleted = 0;

        // 1. Purge old RSS feed articles (Keep only the latest 2000)
        let rssDeleted = 0;
        const rssLimitCheck = await ctx.db
            .query("rss_feed_articles")
            .withIndex("by_createdAt")
            .order("desc")
            .take(2001);
        
        if (rssLimitCheck.length > 2000) {
            const cutoffTime = rssLimitCheck[2000].createdAt;
            const toDelete = await ctx.db
                .query("rss_feed_articles")
                .withIndex("by_createdAt", (q) => q.lte("createdAt", cutoffTime))
                .take(200); // Process in batches of 200 to avoid long transactions
            for (const doc of toDelete) {
                await ctx.db.delete(doc._id);
                rssDeleted++;
            }
            totalDeleted += rssDeleted;
        }

        // 2. Purge old OSINT results (older than 7 days)
        let osintDeleted = 0;
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const oldOsint = await ctx.db
            .query("osint_results")
            .withIndex("by_created_at", (q) => q.lt("createdAt", sevenDaysAgo))
            .take(200);
        for (const doc of oldOsint) {
            await ctx.db.delete(doc._id);
            osintDeleted++;
        }
        totalDeleted += osintDeleted;

        // 3. Purge old Dark Web results (older than 7 days)
        let darkwebDeleted = 0;
        const oldDarkweb = await ctx.db
            .query("darkweb_results")
            .withIndex("by_discovered_at", (q) => q.lt("discovered_at", sevenDaysAgo))
            .take(200);
        for (const doc of oldDarkweb) {
            await ctx.db.delete(doc._id);
            darkwebDeleted++;
        }
        totalDeleted += darkwebDeleted;

        // 4. Purge old free analyses (older than 7 days)
        let analysesDeleted = 0;
        const oldAnalyses = await ctx.db
            .query("free_analyses")
            .withIndex("by_timestamp", (q) => q.lt("timestamp", sevenDaysAgo))
            .take(200);
        for (const doc of oldAnalyses) {
            await ctx.db.delete(doc._id);
            analysesDeleted++;
        }
        totalDeleted += analysesDeleted;

        // 5. Purge old media monitoring articles (older than 30 days)
        let monitoringDeleted = 0;
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const oldMonitoring = await ctx.db
            .query("media_monitoring_articles")
            .withIndex("by_createdAt", (q) => q.lt("createdAt", thirtyDaysAgo))
            .take(200);
        for (const doc of oldMonitoring) {
            await ctx.db.delete(doc._id);
            monitoringDeleted++;
        }
        totalDeleted += monitoringDeleted;

        // Self-reschedule next batch if any limit was hit (200 records deleted in this transaction)
        const hasMore = (rssDeleted === 200 || osintDeleted === 200 || darkwebDeleted === 200 || analysesDeleted === 200 || monitoringDeleted === 200);
        if (hasMore) {
            await ctx.scheduler.runAfter(0, api.monitoring.purgeOldData, {});
        }

        return { success: true, deletedCount: totalDeleted };
    },
});
