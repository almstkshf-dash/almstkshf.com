/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
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

/**
 * Returns live progress for a running job by aggregating its event rows.
 * Safe to poll frequently — only reads, no writes.
 */
export const getJobProgress = query({
    args: { jobId: v.id("press_release_sync_jobs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const job = await ctx.db.get(args.jobId);
        if (!job) return null;

        const events = await ctx.db
            .query("press_release_job_events")
            .withIndex("by_jobId_and_createdAt", (q) => q.eq("jobId", args.jobId))
            .order("asc")
            .take(8192); // schema limit for arrays

        let totalSaved = 0;
        let totalErrors = 0;
        const feedResults: Array<{
            feed: string;
            name: string;
            saved: number;
            total: number;
            error?: string;
            durationMs?: number;
        }> = [];

        for (const ev of events) {
            totalSaved += ev.saved;
            if (ev.error) totalErrors++;
            feedResults.push({
                feed: ev.feedName,
                name: ev.feedName,
                saved: ev.saved,
                total: ev.total,
                error: ev.error,
                durationMs: ev.durationMs,
            });
        }

        return {
            ...job,
            completedSources: events.length,
            totalSaved,
            totalErrors,
            feedResults,
        };
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

/**
 * Replaces the old updatePressReleaseSyncJobProgress.
 * Each worker inserts ONE new event row — no read-modify-write on the job document.
 * This eliminates OCC write conflicts entirely.
 */
export const insertPressReleaseJobEvent = internalMutation({
    args: {
        jobId: v.id("press_release_sync_jobs"),
        feedName: v.string(),
        saved: v.number(),
        total: v.number(),
        error: v.optional(v.string()),
        durationMs: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("press_release_job_events", {
            jobId: args.jobId,
            feedName: args.feedName,
            saved: args.saved,
            total: args.total,
            error: args.error,
            durationMs: args.durationMs,
            createdAt: Date.now(),
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

        // Aggregate event rows for the final summary written to the job document.
        const events = await ctx.db
            .query("press_release_job_events")
            .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
            .take(8192);

        let totalSaved = 0;
        let totalErrors = 0;
        for (const ev of events) {
            totalSaved += ev.saved;
            if (ev.error) totalErrors++;
        }

        // Security Review: Audit Log completion
        await ctx.db.insert("admin_actions", {
            userId: job.userId,
            action: `PRESS_RELEASE_SYNC_${args.status.toUpperCase()}`,
            timestamp: Date.now(),
            parameters: { jobId: args.jobId },
            result: {
                totalSaved,
                totalErrors,
                completedSources: events.length,
                error: args.error,
            },
        });

        await ctx.db.patch(args.jobId, {
            status: args.status,
            error: args.error,
            completedSources: events.length,
            totalSaved,
            totalErrors,
            updatedAt: Date.now(),
        });
    },
});

/**
 * One-shot migration: strips the legacy embedded `feedResults` field from all
 * press_release_sync_jobs documents that still carry it.
 * Run once via: npx convex run pressReleaseJobs:migrateStripFeedResults
 * Safe to re-run — documents already clean are left untouched.
 */
export const migrateStripFeedResults = internalMutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("press_release_sync_jobs").collect();
        let patched = 0;
        for (const job of all) {
            if ((job as any).feedResults !== undefined) {
                const { feedResults: _dropped, ...rest } = job as any;
                await ctx.db.replace(job._id, rest);
                patched++;
            }
        }
        return { patched };
    },
});
