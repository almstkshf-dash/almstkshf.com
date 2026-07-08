/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getReportJob = query({
    args: { jobId: v.id("report_jobs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const job = await ctx.db.get(args.jobId);
        if (!job || job.userId !== identity.subject) {
            return null;
        }
        return job;
    },
});

export const getLatestActiveJob = query({
    args: { reportType: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const latestJob = await ctx.db
            .query("report_jobs")
            .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .filter((q) => q.eq(q.field("reportType"), args.reportType))
            .take(1);

        if (latestJob[0] && (latestJob[0].status === "pending" || latestJob[0].status === "processing")) {
            return latestJob[0];
        }
        return null;
    },
});

export const listReportJobs = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const limit = args.limit ?? 20;
        return await ctx.db
            .query("report_jobs")
            .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(limit);
    },
});

export const createReportJob = mutation({
    args: {
        reportType: v.string(),
        format: v.union(v.literal("pdf"), v.literal("excel"), v.literal("csv")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        return await ctx.db.insert("report_jobs", {
            userId: identity.subject,
            reportType: args.reportType,
            format: args.format,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const updateReportJobStatus = mutation({
    args: {
        jobId: v.id("report_jobs"),
        status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
        url: v.optional(v.string()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        const updates: Partial<typeof job> = {
            status: args.status,
        };

        if (args.url !== undefined) {
            updates.url = args.url;
        }
        if (args.error !== undefined) {
            updates.error = args.error;
        }
        if (args.status === "completed" || args.status === "failed") {
            updates.completedAt = Date.now();
        }

        await ctx.db.patch(args.jobId, updates);
    },
});
