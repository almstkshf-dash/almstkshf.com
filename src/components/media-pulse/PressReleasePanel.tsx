'use client';

import { useState } from 'react';
import { useAction, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    Newspaper, RefreshCw, CheckCircle2, XCircle, Rss,
    TrendingUp, Clock, Lock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

// ─── PR wire sources metadata (mirrored from backend for display) ────
const PR_WIRES = [
    { name: 'PR Newswire', region: 'Global', flag: '🌍' },
    { name: 'Business Wire', region: 'Global', flag: '🌍' },
    { name: 'GlobeNewswire MENA', region: 'MENA', flag: '🌐' },
    { name: 'Zawya PR', region: 'AE', flag: '🇦🇪' },
    { name: 'WAM (UAE EN)', region: 'AE', flag: '🇦🇪' },
    { name: 'WAM (UAE AR)', region: 'AE', flag: '🇦🇪' },
    { name: 'SPA (Saudi)', region: 'SA', flag: '🇸🇦' },
    { name: 'MENA FN', region: 'MENA', flag: '🌐' },
    { name: 'Gulf News PR', region: 'AE', flag: '🇦🇪' },
];

type FeedResult = {
    feed: string;
    saved?: number;
    total?: number;
    error?: string;
};

export default function PressReleasePanel() {
    const t = useTranslations('PressReleasePanel');
    const { isAuthenticated } = useConvexAuth();
    const isAdmin = useQuery(
        (api as any).authQueries?.checkIsAdmin,
        isAuthenticated ? {} : 'skip'
    ) ?? false;
    const [loading, setLoading] = useState(false);
    const [syncResult, setSyncResult] = useState<{
        totalSaved: number;
        totalErrors: number;
        feedResults: FeedResult[];
        message: string;
    } | null>(null);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [limitPerFeed, setLimitPerFeed] = useState(30);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchPR = useAction(api.monitoringAction.fetchPressReleaseSources);

    // Live count of PR articles in DB
    const prStats = useQuery(
        api.monitoring.getArticles,
        isAuthenticated ? { limit: 1, sourceType: 'Press Release' } : 'skip'
    ) as { total: number } | undefined | null;
    const prCount = prStats?.total ?? 0;

    const handleSync = async () => {
        if (!isAuthenticated) { setError(t('not_authenticated')); return; }
        if (!isAdmin) { setError('This action requires admin privileges.'); return; }
        setLoading(true);
        setError('');
        setSyncResult(null);
        try {
            const res = await fetchPR({
                keyword: keyword.trim() || undefined,
                limit: limitPerFeed,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            }) as any;
            setSyncResult(res);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : t('fetch_failed');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Rss className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
                        <p className="text-[11px] text-muted-foreground">
                            {t('subtitle', { count: PR_WIRES.length })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live count badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {t('db_count', { count: prCount })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Row 1: keyword + limit */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Newspaper className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <label htmlFor="pr-keyword-input" className="sr-only">{t('keyword_placeholder')}</label>
                        <input
                            id="pr-keyword-input"
                            name="keyword"
                            type="text"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            placeholder={t('keyword_placeholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <label htmlFor="pr-limit-per-feed" className="text-xs text-muted-foreground whitespace-nowrap">{t('max_per_feed')}</label>
                        <input
                            id="pr-limit-per-feed"
                            name="limitPerFeed"
                            type="number"
                            min={5}
                            max={200}
                            value={limitPerFeed}
                            onChange={e => setLimitPerFeed(Math.max(5, Math.min(200, Number(e.target.value))))}
                            className="w-20 px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Row 2: date range + sync button */}
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 flex-1">
                        <label htmlFor="pr-date-from" className="text-xs text-muted-foreground whitespace-nowrap">{t('date_from')}</label>
                        <input
                            id="pr-date-from"
                            name="dateFrom"
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            disabled={loading}
                        />
                        <label htmlFor="pr-date-to" className="text-xs text-muted-foreground whitespace-nowrap">{t('date_to')}</label>
                        <input
                            id="pr-date-to"
                            name="dateTo"
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={e => setDateTo(e.target.value)}
                            className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            disabled={loading}
                        />
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={() => { setDateFrom(''); setDateTo(''); }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                                title={t('clear')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {!isAdmin && isAuthenticated && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5 rounded-lg">
                            <Lock className="w-3 h-3" />
                            Admin only
                        </span>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleSync}
                        disabled={loading || !isAuthenticated || !isAdmin}
                        isLoading={loading}
                        className="px-5 font-bold text-sm h-auto whitespace-nowrap shrink-0"
                        title={!isAdmin ? 'This feature requires admin privileges' : undefined}
                    >
                        {loading ? t('syncing') : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />{t('sync_now')}</>}
                    </Button>
                </div>

                {/* Wire source badges */}
                <div className="flex flex-wrap gap-2">
                    {PR_WIRES.map(w => (
                        <span
                            key={w.name}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground"
                        >
                            <span>{w.flag}</span>
                            {w.name}
                        </span>
                    ))}
                </div>

                {/* Status messages */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {syncResult && (
                    <div className="space-y-3">
                        {/* Summary */}
                        <div className={clsx(
                            'flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border',
                            syncResult.totalErrors === 0
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        )}>
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>{syncResult.message}</span>
                            {syncResult.totalErrors > 0 && (
                                <span className="ml-auto text-xs opacity-70">{syncResult.totalErrors} feed(s) failed</span>
                            )}
                        </div>

                        {syncResult.totalSaved === 0 && keyword.trim() && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                                <span className="text-lg">🔍</span>
                                <span>No articles matched <strong>&quot;{keyword}&quot;</strong> across all 9 feeds. Try a shorter or broader keyword.</span>
                            </div>
                        )}
                        {/* Per-feed breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {syncResult.feedResults.map((f: FeedResult) => (
                                <div
                                    key={f.feed}
                                    className={clsx(
                                        'flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium',
                                        f.error
                                            ? 'bg-destructive/5 border-destructive/20 text-destructive'
                                            : 'bg-muted border-border text-foreground'
                                    )}
                                >
                                    <span className="truncate">{f.feed}</span>
                                    {f.error ? (
                                        <span className="ml-2 text-[10px] opacity-70 flex-shrink-0">{t('failed')}</span>
                                    ) : (
                                        <span className="ml-2 flex-shrink-0 text-emerald-600 dark:text-emerald-400 font-bold">
                                            +{f.saved ?? 0}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cron hint */}
                <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5 border-t border-border/50 pt-4">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {t('cron_hint')}
                </p>
            </div>
        </div>
    );
}
