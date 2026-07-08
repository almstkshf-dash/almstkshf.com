/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Newspaper, RefreshCw, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SyncState } from './hooks/usePressReleaseSync';

type SyncControlsProps = {
    t: (key: string, options?: any) => string;
    keyword: string;
    setKeyword: (kw: string) => void;
    limitPerFeed: number;
    setLimitPerFeed: (limit: number) => void;
    dateFrom: string;
    setDateFrom: (d: string) => void;
    dateTo: string;
    setDateTo: (d: string) => void;
    syncState: SyncState;
    handleSync: () => void;
    retryCountdown: number | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
};

export default function SyncControls({
    t,
    keyword,
    setKeyword,
    limitPerFeed,
    setLimitPerFeed,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    syncState,
    handleSync,
    retryCountdown,
    isAdmin,
    isAuthenticated,
}: SyncControlsProps) {
    const isRunning = syncState.status === "running";
    const percent = Math.min(100, Math.round((syncState.completedSources / (syncState.totalSources || 1)) * 100));

    return (
        <div className="space-y-4">
            {/* Row 1: keyword + limit */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Newspaper className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
                    <label htmlFor="pr-keyword-input" className="sr-only">{t('keyword_placeholder')}</label>
                    <input
                        id="pr-keyword-input"
                        name="keyword"
                        type="text"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder={t('keyword_placeholder')}
                        className="w-full ps-9 pe-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-foreground/40"
                        disabled={isRunning}
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor="pr-limit-per-feed" className="text-xs text-foreground/60 whitespace-nowrap">{t('max_per_feed')}</label>
                    <input
                        id="pr-limit-per-feed"
                        name="limitPerFeed"
                        type="number"
                        min={5}
                        max={200}
                        value={limitPerFeed}
                        onChange={e => setLimitPerFeed(Math.max(5, Math.min(200, Number(e.target.value))))}
                        className="w-20 px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        disabled={isRunning}
                    />
                </div>
            </div>

            {/* Row 2: date range + sync button */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex items-center gap-2 flex-1">
                    <label htmlFor="pr-date-from" className="text-xs text-foreground/60 whitespace-nowrap">{t('date_from')}</label>
                    <input
                        id="pr-date-from"
                        name="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        disabled={isRunning}
                    />
                    <label htmlFor="pr-date-to" className="text-xs text-foreground/60 whitespace-nowrap">{t('date_to')}</label>
                    <input
                        id="pr-date-to"
                        name="dateTo"
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={e => setDateTo(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        disabled={isRunning}
                    />
                    {(dateFrom || dateTo) && (
                        <button
                            type="button"
                            onClick={() => { setDateFrom(''); setDateTo(''); }}
                            className="text-xs text-foreground/80 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                            title={t('clear')}
                            aria-label={t('clear')}
                        >
                            ✖
                        </button>
                    )}
                </div>
                <div className="flex items-center justify-end gap-3 shrink-0">
                    {!isAdmin && isAuthenticated && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5 rounded-lg">
                            <Lock className="w-3 h-3" aria-hidden="true" />
                            {t('admin_only_badge')}
                        </span>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleSync}
                        disabled={isRunning || !!retryCountdown || !isAuthenticated || !isAdmin}
                        isLoading={isRunning}
                        className="px-5 font-bold text-sm h-auto whitespace-nowrap"
                        title={!isAdmin ? t('admin_only') : undefined}
                    >
                        {isRunning
                            ? `${t('syncing')} (${percent}%)`
                            : retryCountdown
                                ? `${retryCountdown}s`
                                : (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 me-1.5 animate-none" aria-hidden="true" />
                                        {t('sync_now')}
                                    </>
                                )
                        }
                    </Button>
                </div>
            </div>

            {/* Active background sync progress tracking UI */}
            {isRunning && (
                <div className="w-full bg-muted/40 border border-border/80 rounded-xl p-4 flex flex-col gap-2 shadow-sm animate-pulse">
                    <div className="flex justify-between items-center text-xs font-semibold text-foreground/80">
                        <span>{t('syncing_progress', { completed: syncState.completedSources, total: syncState.totalSources })}</span>
                        <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-300 ease-out"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-foreground/60 flex justify-between">
                        <span>
                            {t('syncing_stats', { saved: syncState.totalSaved, failed: syncState.totalErrors })}
                        </span>
                        <span>{t('sync_running')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
