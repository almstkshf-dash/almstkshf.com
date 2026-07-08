/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./utils/auth";
import { api } from "./_generated/api";

export const getPressReleaseSyncJob = query({
    args: { jobId: v.id("press_release_sync_jobs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        return await ctx.db.get(args.jobId);
    },
});

export const getActivePressReleaseSyncJob = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        // Get latest running or pending job for this user
        const latestJob = await ctx.db
            .query("press_release_sync_jobs")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(1);

        if (latestJob[0] && (latestJob[0].status === "running" || latestJob[0].status === "pending")) {
            return latestJob[0];
        }
        return null;
    },
});

export const createPressReleaseSyncJob = mutation({
    args: {
        keyword: v.optional(v.string()),
        limit: v.number(),
        dateFrom: v.optional(v.string()),
        dateTo: v.optional(v.string()),
        totalSources: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }
        // Security Review: Backend Admin Check
        await requireAdmin(ctx.auth);

        // Security Review: Audit Log
        await ctx.db.insert("admin_actions", {
            userId: identity.subject,
            action: "PRESS_RELEASE_SYNC_START",
            timestamp: Date.now(),
            parameters: {
                keyword: args.keyword,
                limit: args.limit,
                dateFrom: args.dateFrom,
                dateTo: args.dateTo,
                totalSources: args.totalSources,
            },
            result: null,
        });

        // Insert pending job record
        const jobId = await ctx.db.insert("press_release_sync_jobs", {
            userId: identity.subject,
            status: "pending",
            keyword: args.keyword,
            limit: args.limit,
            dateFrom: args.dateFrom,
            dateTo: args.dateTo,
            totalSources: args.totalSources,
            completedSources: 0,
            totalSaved: 0,
            totalErrors: 0,
            feedResults: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Schedule the background sync action
        await ctx.scheduler.runAfter(0, api.monitoringAction.fetchPressReleaseSources, {
            keyword: args.keyword,
            limit: args.limit,
            dateFrom: args.dateFrom,
            dateTo: args.dateTo,
            jobId: jobId,
        });

        return jobId;
    },
});

export const startPressReleaseSyncJob = mutation({
    args: { jobId: v.id("press_release_sync_jobs") },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }
        await ctx.db.patch(args.jobId, {
            status: "running",
            updatedAt: Date.now(),
        });
    },
});

export const updatePressReleaseSyncJobProgress = mutation({
    args: {
        jobId: v.id("press_release_sync_jobs"),
        completedSources: v.number(),
        totalSaved: v.number(),
        totalErrors: v.number(),
        feedResult: v.object({
            feed: v.string(),
            name: v.optional(v.string()),
            saved: v.optional(v.number()),
            total: v.optional(v.number()),
            error: v.optional(v.string()),
            durationMs: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }
        const currentResults = job.feedResults || [];
        await ctx.db.patch(args.jobId, {
            completedSources: args.completedSources,
            totalSaved: job.totalSaved + args.totalSaved,
            totalErrors: job.totalErrors + args.totalErrors,
            feedResults: [...currentResults, args.feedResult],
            updatedAt: Date.now(),
        });
    },
});

export const completePressReleaseSyncJob = mutation({
    args: {
        jobId: v.id("press_release_sync_jobs"),
        status: v.union(v.literal("success"), v.literal("error")),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        // Security Review: Audit Log completion
        await ctx.db.insert("admin_actions", {
            userId: job.userId,
            action: `PRESS_RELEASE_SYNC_${args.status.toUpperCase()}`,
            timestamp: Date.now(),
            parameters: { jobId: args.jobId },
            result: {
                totalSaved: job.totalSaved,
                totalErrors: job.totalErrors,
                completedSources: job.completedSources,
                error: args.error,
            },
        });

        await ctx.db.patch(args.jobId, {
            status: args.status,
            error: args.error,
            updatedAt: Date.now(),
        });
    },
});
