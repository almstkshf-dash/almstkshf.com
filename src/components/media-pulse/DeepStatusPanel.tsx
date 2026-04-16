/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useQuery, useAction, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    Loader2, RefreshCw, ScanSearch, Globe, Languages,
    Hash, CheckCircle2, XCircle, Clock, FileText, FileSpreadsheet, FolderPlus
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslations, useMessages } from 'next-intl';
import { useState, useEffect, memo } from 'react';
import { ReportGenerator } from '@/lib/report-generator';
import SaveToCollectionModal from '@/components/ui/SaveToCollectionModal';

const DeepStatusPanel = memo(function DeepStatusPanel() {
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
    const [mounted, setMounted] = useState(false);
    const messages = useMessages();

    useEffect(() => {
        setMounted(true);
    }, []);

    // UI state
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [runToSave, setRunToSave] = useState<any>(null);

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (!runs || runs.length === 0) return;
        setIsExporting(format);
        try {
            await ReportGenerator.exportDeepWebReport(runs, [], messages, format);
        } catch (err) {
            console.error('Deep Web export failed:', err);
        } finally {
            setIsExporting(null);
        }
    };

    const handleFetch = async () => {
        if (!isAuthenticated) {
            setError(t('not_authenticated'));
            return;
        }
        if (!keyword.trim() && !countries.trim()) {
            setError(t('keyword_placeholder'));
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

    if (!mounted) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-48 bg-muted/20 rounded-2xl border border-border" />
                <div className="h-24 bg-muted/20 rounded-2xl border border-border" />
            </div>
        );
    }

    return (
        <section className="space-y-6">
            {/* â”€â”€ Configuration Card â”€â”€ */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <ScanSearch className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-base font-bold">{t('config_panel')}</h3>
                </div>

                {/* Keyword */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {t('search_keyword')}
                    </label>
                    <input
                        type="text"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder={t('keyword_placeholder')}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-foreground/40"
                        disabled={loading}
                    />
                </div>

                {/* Countries + Languages row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {t('target_countries')}
                        </label>
                        <input
                            type="text"
                            value={countries}
                            onChange={e => setCountries(e.target.value)}
                            placeholder={t('countries_placeholder')}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-foreground/40"
                            disabled={loading}
                        />
                        <p className="text-[11px] text-foreground/60">{t('countries_hint')}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {t('content_language')}
                        </label>
                        <input
                            type="text"
                            value={languages}
                            onChange={e => setLanguages(e.target.value)}
                            placeholder={t('language_placeholder')}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-foreground/40"
                            disabled={loading}
                        />
                        <p className="text-[11px] text-foreground/60">{t('language_hint')}</p>
                    </div>
                </div>

                {/* Max results */}
                <div className="flex items-center gap-4">
                    <div className="space-y-1 w-32">
                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
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

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {t('recent_runs')}
                    </div>
                    {runs && runs.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExport('pdf')}
                                disabled={!!isExporting}
                                isLoading={isExporting === 'pdf'}
                                className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2"
                            >
                                <FileText className="w-3 h-3" />
                                PDF
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExport('excel')}
                                disabled={!!isExporting}
                                isLoading={isExporting === 'excel'}
                                className="h-7 text-[9px] uppercase tracking-widest font-bold gap-1.5 rounded-lg px-2"
                            >
                                <FileSpreadsheet className="w-3 h-3" />
                                EXCEL
                            </Button>
                        </div>
                    )}
                </div>

                {runs === undefined && (
                    <div className="flex items-center gap-2 text-sm text-foreground/70 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('status_scanning')}
                    </div>
                )}
                {runs && runs.length === 0 && (
                    <p className="text-sm text-foreground/70 py-2">{t('no_runs')}</p>
                )}
                <div className="space-y-2">
                    {runs?.map((run: any) => (
                        <div
                            key={run._id}
                            className="flex flex-wrap items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm gap-2"
                        >
                            <span className="font-semibold text-xs text-foreground/80" suppressHydrationWarning>
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
                            <span className="text-foreground/70 text-xs">
                                {run.itemCount} {t('items')}
                            </span>
                            {run.error && (
                                <span className="text-[11px] text-destructive w-full mt-0.5">
                                    {run.error}
                                </span>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1.5 h-auto text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                                    onClick={() => setRunToSave(run)}
                                >
                                    <FolderPlus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {runToSave && (
                <SaveToCollectionModal 
                    isOpen={!!runToSave} 
                    onClose={() => setRunToSave(null)}
                    item={{
                        id: runToSave._id,
                        type: "deep_web",
                        title: `Deep Web Run: ${new Date(runToSave.startedAt).toLocaleString()}`,
                        data: runToSave
                    }}
                />
            )}
        </section>
    );
});

export default DeepStatusPanel;
