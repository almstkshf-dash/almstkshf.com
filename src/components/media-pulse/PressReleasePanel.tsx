/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAction, useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    Newspaper, RefreshCw, CheckCircle2, XCircle, Rss,
    TrendingUp, Clock, Lock, FolderPlus, Trash2, Plus, X, ListFilter,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// ─── PR wire sources metadata (mirrored from backend for display) ────
const PR_WIRES = [
    { name: 'Newswire.com', region: 'Global', flag: '🌐' },
    { name: 'Dubai PR Network', region: 'AE', flag: '🇦🇪' },
    { name: 'Arab News', region: 'MENA', flag: '🌐' },
    { name: 'Asharq Al-Awsat', region: 'MENA', flag: '🌐' },
    { name: 'Al Bawaba', region: 'MENA', flag: '🇯🇴' },
    { name: 'Mehr News', region: 'IR', flag: '🇮🇷' },
    { name: 'Egyptian Streets', region: 'EG', flag: '🇪🇬' },
    { name: 'Middle East Eye', region: 'UK', flag: '🇬🇧' },
    { name: '24.ae', region: 'AE', flag: '🇦🇪' },
    { name: 'UAE Barq', region: 'AE', flag: '🇦🇪' },
    { name: 'Gulf Time', region: 'AE', flag: '🇦🇪' },
    { name: 'New Vora Group', region: 'AE', flag: '🇦🇪' },
    { name: 'Ain Al Emirate', region: 'AE', flag: '🇦🇪' },
    { name: 'Mena Scoop', region: 'AE', flag: '🇦🇪' },
    { name: 'Pan Time Arabia', region: 'AE', flag: '🇦🇪' },
];

type FeedResult = {
    feed: string;
    name?: string;
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
    const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

    // Keyword collection hooks and state
    const [activeCollectionId, setActiveCollectionId] = useState<string>('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newKeyword, setNewKeyword] = useState('');
    const [creatingCol, setCreatingCol] = useState(false);
    const [addingKeyword, setAddingKeyword] = useState(false);

    const collectionsQuery = useQuery(api.keywordCollections.getKeywordCollections);
    const collections = useMemo(() => collectionsQuery || [], [collectionsQuery]);
    const createColMut = useMutation(api.keywordCollections.createKeywordCollection);
    const deleteColMut = useMutation(api.keywordCollections.deleteKeywordCollection);
    const addKeywordMut = useMutation(api.keywordCollections.addKeyword);
    const deleteKeywordMut = useMutation(api.keywordCollections.deleteKeyword);

    useEffect(() => {
        if (collections.length > 0 && !activeCollectionId) {
            setActiveCollectionId(collections[0]._id);
        }
    }, [collections, activeCollectionId]);

    const activeCollection = collections.find((c: any) => c._id === activeCollectionId);

    const fetchPR = useAction(api.monitoringAction.fetchPressReleaseSources);

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
            setError('');
            return;
        }
        const timer = setInterval(() => {
            setRetryCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timer);
    }, [retryCountdown]);

    const handleSync = async () => {
        if (!isAuthenticated) { setError(t('not_authenticated')); return; }
        if (!isAdmin) { setError(t('admin_only')); return; }
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
            if (res.success) {
                setSyncResult(res);
            } else if (res.capacityExhausted) {
                setRetryCountdown(res.retryAfter || 60);
                setError(t('ai_busy_wait', { seconds: res.retryAfter || 60 }));
            } else {
                setError(res.message || t('fetch_failed'));
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : t('fetch_failed');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newCollectionName.trim();
        if (!name) return;
        setCreatingCol(true);
        try {
            const colId = await createColMut({ name });
            setNewCollectionName('');
            setActiveCollectionId(colId);
            toast.success(t('collection_created'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        } finally {
            setCreatingCol(false);
        }
    };

    const handleDeleteCollection = async (colId: string) => {
        if (!confirm(t('confirm_delete_collection', { defaultValue: 'Are you sure you want to delete this collection?' }))) return;
        try {
            await deleteColMut({ id: colId as any });
            setActiveCollectionId(collections.find((c: any) => c._id !== colId)?._id || '');
            toast.success(t('collection_deleted', { defaultValue: 'Collection deleted successfully!' }));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        }
    };

    const handleAddKeyword = async (e: React.FormEvent) => {
        e.preventDefault();
        const kw = newKeyword.trim();
        if (!activeCollectionId || !kw) return;
        setAddingKeyword(true);
        try {
            await addKeywordMut({
                collectionId: activeCollectionId as any,
                keyword: kw
            });
            setNewKeyword('');
            toast.success(t('keyword_added'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        } finally {
            setAddingKeyword(false);
        }
    };

    const handleDeleteKeyword = async (kw: string) => {
        if (!activeCollectionId) return;
        try {
            await deleteKeywordMut({
                collectionId: activeCollectionId as any,
                keyword: kw
            });
            toast.success(t('keyword_deleted'));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('fetch_failed'));
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Rss className="w-4 h-4 text-blue-500" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
                        <p className="text-[11px] text-foreground/70">
                            {t('subtitle', { count: PR_WIRES.length })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live count badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Row 2: date range + sync button */}
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 flex-1">
                        <label htmlFor="pr-date-from" className="text-xs text-foreground/60 whitespace-nowrap">{t('date_from')}</label>
                        <input
                            id="pr-date-from"
                            name="dateFrom"
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            disabled={loading}
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
                            disabled={loading}
                        />
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={() => { setDateFrom(''); setDateTo(''); }}
                                className="text-xs text-foreground/80 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                                title={t('clear')}
                                aria-label={t('clear')}
                            >
                                ✖
                            </button>
                        )}
                    </div>
                    {!isAdmin && isAuthenticated && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1.5 rounded-lg">
                            <Lock className="w-3 h-3" aria-hidden="true" />
                            {t('admin_only_badge')}
                        </span>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleSync}
                        disabled={loading || !!retryCountdown || !isAuthenticated || !isAdmin}
                        isLoading={loading}
                        className="px-5 font-bold text-sm h-auto whitespace-nowrap shrink-0"
                        title={!isAdmin ? t('admin_only') : undefined}
                    >
                        {loading ? t('syncing') : retryCountdown ? `${retryCountdown}s` : <><RefreshCw className="w-3.5 h-3.5 me-1.5" aria-hidden="true" />{t('sync_now')}</>}
                    </Button>
                </div>

                {/* Monitored Keyword Collections Card */}
                <div className="bg-muted/30 border border-border/80 rounded-xl p-5 space-y-4">
                    {/* Collection Header/Selector */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                        <div className="flex items-center gap-2">
                            <ListFilter className="w-4 h-4 text-primary" aria-hidden="true" />
                            <div>
                                <span className="text-xs font-semibold text-foreground/80">{t('collection_label')}</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <select
                                        value={activeCollectionId}
                                        onChange={e => setActiveCollectionId(e.target.value)}
                                        className="bg-background border border-border rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 font-medium cursor-pointer"
                                    >
                                        <option value="">{t('select_collection_placeholder')}</option>
                                        {collections.map((c: any) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {activeCollectionId && (
                                        <button
                                            onClick={() => handleDeleteCollection(activeCollectionId)}
                                            className="p-1.5 text-foreground/50 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                            title={t('delete_keyword_tooltip')}
                                            aria-label={t('delete_keyword_tooltip')}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Inline Create Collection Form */}
                        <form onSubmit={handleCreateCollection} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newCollectionName}
                                onChange={e => setNewCollectionName(e.target.value)}
                                placeholder={t('new_collection_placeholder')}
                                className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 w-44"
                                disabled={creatingCol}
                            />
                            <button
                                type="submit"
                                disabled={creatingCol || !newCollectionName.trim()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                                <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
                                {creatingCol ? '...' : t('create_collection_btn')}
                            </button>
                        </form>
                    </div>

                    {/* Keywords pills display and inline add form */}
                    {activeCollectionId ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">{t('keywords_card_title')}</h4>
                                    <p className="text-[10px] text-foreground/60">{t('keywords_card_subtitle')}</p>
                                </div>
                            </div>

                            {!activeCollection || activeCollection.keywords.length === 0 ? (
                                <div className="text-center py-4 bg-background/40 border border-dashed border-border rounded-lg text-[11px] text-foreground/50">
                                    {t('no_keywords')}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {activeCollection.keywords.map((kw: string) => (
                                        <div
                                            key={kw}
                                            className={clsx(
                                                "group flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer shadow-sm",
                                                keyword === kw
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-background border-border text-foreground hover:border-primary/40 hover:text-primary"
                                            )}
                                            onClick={() => setKeyword(kw)}
                                            title={t('sync_keyword_tooltip')}
                                        >
                                            <span>{kw}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteKeyword(kw);
                                                }}
                                                className="p-0.5 rounded-full text-foreground/40 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                                title={t('delete_keyword_tooltip')}
                                                aria-label={t('delete_keyword_tooltip')}
                                            >
                                                <X className="w-3 h-3" aria-hidden="true" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Keyword Form */}
                            <form onSubmit={handleAddKeyword} className="flex items-center gap-2 pt-2 border-t border-border/20">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={e => setNewKeyword(e.target.value)}
                                    placeholder={t('add_keyword_placeholder')}
                                    className="flex-1 max-w-md px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    disabled={addingKeyword}
                                />
                                <button
                                    type="submit"
                                    disabled={addingKeyword || !newKeyword.trim()}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                    {t('add_keyword_btn')}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-xs text-foreground/50">
                            {t('no_collection_selected')}
                        </div>
                    )}
                </div>

                {/* Wire source badges */}
                <div className="flex flex-wrap gap-2">
                    {PR_WIRES.map(w => (
                        <span
                            key={w.name}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground/70"
                        >
                            <span>{w.flag}</span>
                            {w.name}
                        </span>
                    ))}
                </div>

                {/* Status messages */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                        <XCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}

                {syncResult && (() => {
                    const totalMatched = syncResult.feedResults.reduce((sum, f) => sum + (f.total ?? 0), 0);
                    return (
                        <div className="space-y-3">
                            {/* Summary */}
                            <div className={clsx(
                                'flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border',
                                syncResult.totalErrors === 0
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                                    : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
                            )}>
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                <span>
                                    {syncResult.totalSaved > 0
                                        ? t('sync_success_with_sources', {
                                            count: syncResult.totalSaved,
                                            sources: syncResult.feedResults.filter(f => !f.error).map(f => f.name || f.feed).join(', ')
                                        })
                                        : totalMatched > 0
                                            ? t('sync_success_already_ingested', { count: totalMatched })
                                            : t('sync_success_no_articles')}
                                </span>
                                {syncResult.totalErrors > 0 && (
                                    <span className="ms-auto text-xs opacity-70">{t('feeds_failed', { count: syncResult.totalErrors })}</span>
                                )}
                            </div>

                            {syncResult.totalSaved === 0 && keyword.trim() && (
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
                            {/* Per-feed breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {syncResult.feedResults.map((f: FeedResult, index: number) => (
                                    <div
                                        key={`${f.name || f.feed || 'feed'}-${index}`}
                                        className={clsx(
                                            'flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium',
                                            f.error
                                                ? 'bg-destructive/5 border-destructive/20 text-rose-700 dark:text-rose-300'
                                                : 'bg-muted border-border text-foreground'
                                        )}
                                    >
                                        <span className="truncate">{f.name || f.feed}</span>
                                        {f.error ? (
                                            <span className="ms-2 text-[10px] opacity-70 flex-shrink-0">{t('failed')}</span>
                                        ) : (
                                            <span className="ms-2 flex-shrink-0 text-emerald-800 dark:text-emerald-400 font-bold">
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
                })()}

                {/* Cron hint */}
                <p className="text-[11px] text-foreground/60 flex items-center gap-1.5 border-t border-border/50 pt-4">
                    <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    {t('cron_hint')}
                </p>
            </div>
        </div>
    );
}
