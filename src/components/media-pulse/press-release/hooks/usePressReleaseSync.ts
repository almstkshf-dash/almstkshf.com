/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { MEDIA_SOURCES } from '@/config/media-sources';

export type FeedResult = {
    feed: string;
    name: string;
    saved: number;
    total: number;
    error?: string;
    durationMs?: number;
};

export type SyncState = {
    status: "idle" | "running" | "success" | "error";
    completedSources: number;
    totalSources: number;
    totalSaved: number;
    totalErrors: number;
    feedResults: FeedResult[];
    error?: string;
};

export function usePressReleaseSync(t: (key: string, options?: any) => string) {
    const { isAuthenticated } = useConvexAuth();
    
    // Fixed: type safety for checkIsAdmin
    const isAdmin = useQuery(
        api.authQueries.checkIsAdmin,
        isAuthenticated ? {} : 'skip'
    ) ?? false;

    const [keyword, setKeyword] = useState('');
    const [limitPerFeed, setLimitPerFeed] = useState(30);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

    // Convex Job subscription
    const activeJobFromQuery = useQuery(api.pressReleaseJobs.getActivePressReleaseSyncJob);
    const [activeJobId, setActiveJobId] = useState<Id<"press_release_sync_jobs"> | null>(null);

    useEffect(() => {
        if (activeJobFromQuery) {
            setActiveJobId(activeJobFromQuery._id);
        }
    }, [activeJobFromQuery]);

    const job = useQuery(
        api.pressReleaseJobs.getPressReleaseSyncJob,
        activeJobId ? { jobId: activeJobId } : 'skip'
    );

    // Local result for holding finished job state until a new sync starts
    const [localFinishedJob, setLocalFinishedJob] = useState<SyncState | null>(null);

    // Map DB job state to local SyncState
    const syncState = useMemo<SyncState>(() => {
        if (job) {
            const state: SyncState = {
                status: job.status === "pending" ? "running" : job.status, // pending shows as running to user
                completedSources: job.completedSources,
                totalSources: job.totalSources,
                totalSaved: job.totalSaved,
                totalErrors: job.totalErrors,
                feedResults: (job.feedResults as FeedResult[]) || [],
                error: job.error,
            };

            // Snapshot the job state when it finishes
            if (job.status === "success" || job.status === "error") {
                // If this job is the one currently tracked, set localFinishedJob
                if (activeJobId === job._id) {
                    setLocalFinishedJob(state);
                    setActiveJobId(null); // release subscription to active job
                }
            }
            return state;
        }

        if (localFinishedJob) {
            return localFinishedJob;
        }

        return {
            status: "idle",
            completedSources: 0,
            totalSources: 0,
            totalSaved: 0,
            totalErrors: 0,
            feedResults: [],
        };
    }, [job, localFinishedJob, activeJobId]);

    const createSyncJob = useMutation(api.pressReleaseJobs.createPressReleaseSyncJob);

    // Live count of PR articles in DB
    const prStats = useQuery(
        api.monitoring.getArticles,
        isAuthenticated ? { limit: 1, sourceType: 'Press Release' } : 'skip'
    ) as { total: number } | undefined | null;
    const prCount = prStats?.total ?? 0;

    // Countdown timer effect
    useEffect(() => {
        if (retryCountdown === null) return;
        if (retryCountdown <= 0) {
            setRetryCountdown(null);
            return;
        }
        const timer = setInterval(() => {
            setRetryCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timer);
    }, [retryCountdown]);

    // handleSync memoization
    const handleSync = useCallback(async () => {
        if (!isAuthenticated) { toast.error(t('not_authenticated')); return; }
        if (!isAdmin) { toast.error(t('admin_only')); return; }

        setLocalFinishedJob(null);
        
        // Dynamic feeds count from MEDIA_SOURCES feeds length
        const staticFeedsCount = MEDIA_SOURCES.flatMap(s => s.feeds).length;
        let totalSources = staticFeedsCount;
        const fetchedKeyword = keyword.trim();
        if (fetchedKeyword && !/^https?:\/\//i.test(fetchedKeyword)) {
            // Estimates search engine batches.
            // 74 feeds / 10 batch size = 8 batches per search engine.
            const batchesCount = 8;
            totalSources += batchesCount * 3 + 1; // Google News + Serper + Bing + Historical
        } else if (fetchedKeyword && /^https?:\/\//i.test(fetchedKeyword)) {
            // Direct URL sync is just 1 source
            totalSources = 1;
        }

        try {
            const jobId = await createSyncJob({
                keyword: keyword.trim() || undefined,
                limit: limitPerFeed,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                totalSources,
            });
            setActiveJobId(jobId);
            toast.success(t('sync_running'));
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : t('fetch_failed');
            toast.error(msg);
        }
    }, [isAuthenticated, isAdmin, keyword, limitPerFeed, dateFrom, dateTo, createSyncJob, t]);

    return {
        keyword,
        setKeyword,
        limitPerFeed,
        setLimitPerFeed,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        retryCountdown,
        setRetryCountdown,
        syncState,
        handleSync,
        prCount,
        isAdmin,
        isAuthenticated,
    };
}
