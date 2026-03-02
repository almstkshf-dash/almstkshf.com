'use client';

import { useQuery, useAction, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    Loader2, RefreshCw, ScanSearch, Globe, Languages,
    Hash, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function DeepStatusPanel() {
    const t = useTranslations('DeepSources');
    const { isAuthenticated } = useConvexAuth();
    const runs = useQuery(
        api.deepSources.getDeepRuns,
        isAuthenticated ? { limit: 10 } : 'skip'
    ) as any;
    const fetchDeep = useAction(api.deepSources.fetchDeepSources);

    // Form state
    const [keyword, setKeyword] = useState('');
    const [countries, setCountries] = useState('ae,sa,eg');
    const [languages, setLanguages] = useState('en,ar');
    const [limit, setLimit] = useState(20);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFetch = async () => {
        if (!isAuthenticated) {
            setError(t('not_authenticated'));
            return;
        }
        if (!keyword.trim() && !countries.trim()) {
            setError('Please enter a keyword or topic to monitor.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetchDeep({
                languages: languages.trim() || 'en,ar',
                countries: countries.trim() || 'ae',
                limit,
            }) as any;
            if (res?.success) {
                setSuccess(
                    t('result_count', { count: res.count ?? 0 })
                );
            } else {
                setError(res?.error || t('fetch_failed'));
            }
        } catch (e: any) {
            setError(e?.message || t('fetch_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="space-y-6">
            {/* ── Configuration Card ── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <ScanSearch className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-base font-bold">{t('config_panel')}</h3>
                </div>

                {/* Keyword */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {t('search_keyword')}
                    </label>
                    <input
                        type="text"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder={t('keyword_placeholder')}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-muted-foreground/50"
                        disabled={loading}
                    />
                </div>

                {/* Countries + Languages row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {t('target_countries')}
                        </label>
                        <input
                            type="text"
                            value={countries}
                            onChange={e => setCountries(e.target.value)}
                            placeholder={t('countries_placeholder')}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-muted-foreground/50"
                            disabled={loading}
                        />
                        <p className="text-[11px] text-muted-foreground">{t('countries_hint')}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {t('content_language')}
                        </label>
                        <input
                            type="text"
                            value={languages}
                            onChange={e => setLanguages(e.target.value)}
                            placeholder={t('language_placeholder')}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-muted-foreground/50"
                            disabled={loading}
                        />
                        <p className="text-[11px] text-muted-foreground">{t('language_hint')}</p>
                    </div>
                </div>

                {/* Max results */}
                <div className="flex items-center gap-4">
                    <div className="space-y-1 w-32">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            {t('result_limit')}
                        </label>
                        <input
                            type="number"
                            min={5}
                            max={100}
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex-1 flex justify-end pt-5">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleFetch}
                            isLoading={loading}
                            disabled={!isAuthenticated || loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold h-auto"
                            leftIcon={!loading && <RefreshCw className="w-4 h-4" />}
                        >
                            {loading ? t('scanning') : t('fetch_now')}
                        </Button>
                    </div>
                </div>

                {/* Status messages */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {success}
                    </div>
                )}
            </div>

            {/* ── Recent Scans Card ── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {t('recent_runs')}
                </div>

                {runs === undefined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                    </div>
                )}
                {runs && runs.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">{t('no_runs')}</p>
                )}
                <div className="space-y-2">
                    {runs?.map((run: any) => (
                        <div
                            key={run._id}
                            className="flex flex-wrap items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm gap-2"
                        >
                            <span className="font-semibold text-xs text-muted-foreground">
                                {new Date(run.startedAt).toLocaleString()}
                            </span>
                            <span
                                className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest ${run.status === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : 'bg-rose-500/10 text-rose-500'
                                    }`}
                            >
                                {run.status}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {run.itemCount} {t('items')}
                            </span>
                            {run.error && (
                                <span className="text-[11px] text-destructive w-full mt-0.5">
                                    {run.error}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
