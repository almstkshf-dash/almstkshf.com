/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveReport = mutation({
    args: {
        type: v.union(v.literal("pdf"), v.literal("csv"), v.literal("excel")),
        articleCount: v.number(),
        timestamp: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const reportId = await ctx.db.insert("user_reports", {
            userId: identity.subject,
            type: args.type,
            articleCount: args.articleCount,
            timestamp: args.timestamp,
        });

        return reportId;
    },
});
