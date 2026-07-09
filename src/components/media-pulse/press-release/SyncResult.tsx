/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { SyncState, FeedResult } from './hooks/usePressReleaseSync';

type SyncResultProps = {
    t: (key: string, options?: any) => string;
    syncState: SyncState;
    keyword: string;
};

export default function SyncResult({
    t,
    syncState,
    keyword,
}: SyncResultProps) {
    // Only display result block if the status is success or error with results
    if (syncState.status !== "success" && syncState.status !== "error") {
        return null;
    }
    if (syncState.feedResults.length === 0) {
        return null;
    }

    const totalMatched = syncState.feedResults.reduce((sum, f) => sum + (f.total ?? 0), 0);

    return (
        <div className="space-y-3">
            {/* Summary Banner */}
            <div className={clsx(
                'flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border',
                syncState.totalErrors === 0
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                    : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
            )}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>
                    {syncState.totalSaved > 0
                        ? t('sync_success_with_sources', {
                            count: syncState.totalSaved,
                            sources: syncState.feedResults.filter(f => !f.error).map(f => f.name || f.feed).join(', ')
                        })
                        : totalMatched > 0
                            ? t('sync_success_already_ingested', { count: totalMatched })
                            : t('sync_success_no_articles')}
                </span>
                {syncState.totalErrors > 0 && (
                    <span className="ms-auto text-xs opacity-70">
                        {t('feeds_failed', { count: syncState.totalErrors })}
                    </span>
                )}
            </div>

            {/* Keyword Specific Existing Matches Alert */}
            {syncState.totalSaved === 0 && keyword.trim() && (
                <div className={clsx(
                    "flex items-center gap-2 text-sm rounded-xl px-4 py-3 border",
                    totalMatched > 0
                        ? "text-blue-700 dark:text-blue-300 bg-blue-500/5 border-blue-500/20"
                        : "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/20"
                )}>
                    <span className="text-lg">🔎</span>
                    <span>
                        {totalMatched > 0
                            ? t('existing_keyword_matches', { count: totalMatched, keyword })
                            : t('no_keyword_match', { keyword })
                        }
                    </span>
                </div>
            )}

            {/* Per-feed grid breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pe-1">
                {syncState.feedResults.map((f: FeedResult, index: number) => (
                    <div
                        key={`${f.name || f.feed || 'feed'}-${index}`}
                        className={clsx(
                            'flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium',
                            f.error
                                ? 'bg-destructive/5 border-destructive/20 text-rose-700 dark:text-rose-300'
                                : 'bg-muted border-border text-foreground'
                        )}
                    >
                        <span className="truncate me-2 flex-1">{f.name || f.feed}</span>
                        {f.error ? (
                            <span className="text-[10px] opacity-70 flex-shrink-0 bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-600">
                                {t('failed')}
                            </span>
                        ) : (
                            <span className="flex-shrink-0 text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {f.total && f.total > 0
                                    ? t('feed_saved_with_total', { saved: f.saved ?? 0, total: f.total })
                                    : t('feed_saved_only', { saved: f.saved ?? 0 })
                                }
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
