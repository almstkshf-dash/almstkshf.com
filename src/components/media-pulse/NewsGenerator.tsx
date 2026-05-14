/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';
import clsx from 'clsx';
import * as React from 'react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAction, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, AlertTriangle, CheckCircle2, Languages, Filter, ChevronDown, X, Globe, Sparkles, Wand2 } from "lucide-react";
import Button from "../ui/Button";
import { useLocale, useTranslations } from 'next-intl';
import { FetchNewsResponse, OptimizeQueryResponse } from '@/types/api';

import { ALL_COUNTRIES, LANGUAGES } from '@/lib/countries';
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown';

export default function NewsGenerator({ defaultSourceType }: { defaultSourceType?: string }) {
    const locale = useLocale();
    const t = useTranslations('NewsGenerator');
    const isAr = locale === 'ar';

    // Guard: ensure Clerk token is propagated to Convex before firing the action
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const fetchNews = useAction(api.monitoringAction.fetchNews);
    const optimizeSearch = useAction(api.searchOptimizer.optimizeQuery);

    const tOpt = useTranslations('SearchOptimizer');

    const [keyword, setKeyword] = useState('');
    const [optimizationInfo, setOptimizationInfo] = useState<{ original: string; explanation: string } | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>(['AE']);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(isAr ? ['ar', 'en'] : ['en', 'ar']);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>(
        defaultSourceType ? [defaultSourceType] : ['Online News', 'Press Release']
    );

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<FetchNewsResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

    // Validation errors
    const [errors, setErrors] = useState<{ keyword?: string; countries?: string; languages?: string }>({});

    // Convert HTML date (YYYY-MM-DD) → DD/MM/YYYY for backend
    const formatDateForBackend = useCallback((htmlDate: string): string => {
        if (!htmlDate) return '';
        const [y, m, d] = htmlDate.split('-');
        return `${d}/${m}/${y}`;
    }, []);

    const sourceTypes = useMemo(() => [
        { id: 'Online News', label: t('source_types_list.online_news'), searchStr: 'Online News أخبار عبر الإنترنت' },
        { id: 'Press Release', label: t('source_types_list.press_release'), searchStr: 'Press Release بيان صحفي' },
        { id: 'Blog', label: t('source_types_list.blog'), searchStr: 'Blog مدونة' },
        { id: 'Social Media', label: t('source_types_list.social_media'), searchStr: 'Social Media وسائل التواصل الاجتماعي' },
        { id: 'Print', label: t('source_types_list.print'), searchStr: 'Print صحافة مطبوعة' },
    ], [t]);

    // Country helpers
    const countryItems = React.useMemo(() => ALL_COUNTRIES.map((c) => ({
        id: c.code,
        label: isAr ? c.ar : c.en,
        searchStr: `${c.en} ${c.ar} ${c.code}`,
    })), [isAr]);

    const getCountryByCode = useCallback((code: string) => ALL_COUNTRIES.find((c) => c.code === code), []);

    // Language helpers
    const languageItems = React.useMemo(() => LANGUAGES.map((l) => ({
        id: l.code,
        label: isAr ? l.ar : l.en,
        searchStr: `${l.en} ${l.ar} ${l.code}`,
    })), [isAr]);

    const validate = useCallback((): boolean => {
        const newErrors: typeof errors = {};
        if (!keyword.trim()) newErrors.keyword = t('error_keyword_required');
        if (selectedCountries.length === 0) newErrors.countries = t('error_country_required');
        if (selectedLanguages.length === 0) newErrors.languages = t('error_language_required');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [keyword, selectedCountries, selectedLanguages, t]);

    useEffect(() => {
        if (retryCountdown === null) return;
        if (retryCountdown <= 0) {
            setRetryCountdown(null);
            setErrorMsg('');
            return;
        }
        const timer = setInterval(() => {
            setRetryCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timer);
    }, [retryCountdown]);

    const handleGenerate = useCallback(async () => {
        if (!validate()) return;
        // Safety: never invoke an authenticated action when Convex hasn't received the token yet
        if (!isAuthenticated) {
            setErrorMsg(t('not_authenticated'));
            return;
        }
        setLoading(true);
        setResult(null);
        setErrorMsg('');
        try {
            const res = await fetchNews({
                keyword: keyword.trim(),
                countries: selectedCountries.join(','),
                languages: selectedLanguages.join(','),
                sourceTypes: selectedSourceTypes.join(','),
                dateFrom: dateFrom ? formatDateForBackend(dateFrom) : undefined,
                dateTo: dateTo ? formatDateForBackend(dateTo) : undefined,
            }) as FetchNewsResponse;

            if (res.success) {
                setResult(res);
            } else {
                if (res.capacityExhausted) {
                    setRetryCountdown(res.retryAfter || 60);
                    setErrorMsg(t('ai_busy_wait', { seconds: res.retryAfter || 60 }));
                } else {
                    setErrorMsg(res.error || t('fetch_failed'));
                }
            }
        } catch (error: unknown) {
            console.error("News fetch internal error:", error);
            setErrorMsg(t('fetch_failed'));
        } finally {
            setLoading(false);
        }
    }, [validate, isAuthenticated, keyword, selectedCountries, selectedLanguages, selectedSourceTypes, dateFrom, dateTo, fetchNews, t, formatDateForBackend]);

    const clearForm = useCallback(() => {
        setKeyword('');
        setOptimizationInfo(null);
        setSelectedCountries(['AE']);
        setSelectedLanguages(isAr ? ['ar', 'en'] : ['en', 'ar']);
        setDateFrom('');
        setDateTo('');
        setResult(null);
        setErrorMsg('');
        setErrors({});
    }, [isAr]);

    const handleOptimize = async () => {
        if (!keyword.trim()) return;
        setIsOptimizing(true);
        try {
            const res = await optimizeSearch({
                keyword: keyword.trim(),
                context: 'news',
                targetLanguages: selectedLanguages
            }) as OptimizeQueryResponse;
            if (res && res.optimized) {
                setOptimizationInfo({
                    original: keyword,
                    explanation: res.explanation
                });
                setKeyword(res.optimized);
            }
        } catch (e) {
            console.error("Optimization failed:", e);
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <section className="relative z-20 bg-card border border-border rounded-2xl overflow-visible backdrop-blur-sm shadow-sm transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors">
                        <Search className="w-4.5 h-4.5 text-blue-800 dark:text-blue-300" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-foreground font-bold text-sm transition-colors">{t('monitor_keyword')}</h2>
                        <p className="text-foreground/70 text-[11px] transition-colors">{t('subtitle')}</p>
                    </div>
                </div>
                {(keyword || result || errorMsg) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearForm}
                        className="text-xs text-foreground/80 hover:text-foreground gap-1 border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 h-auto shadow-none"
                    >
                        <X className="w-3 h-3" />
                        {t('clear')}
                    </Button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Keyword Input */}
                <div>
                    <label htmlFor="monitor_keyword" className="sr-only">{t('monitor_keyword')}</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
                        <input
                            id="monitor_keyword"
                            name="monitor_keyword"
                            type="text"
                            placeholder={t('placeholder')}
                            value={keyword}
                            onChange={(e) => {
                                const val = e.target.value;
                                setKeyword(val);
                                if (errors.keyword) {
                                    setErrors(prev => ({ ...prev, keyword: undefined }));
                                }
                                if (optimizationInfo) setOptimizationInfo(null);
                            }}
                            autoComplete="on"
                            className={`w-full bg-muted/50 rounded-xl pl-11 pr-12 py-3.5 text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none placeholder:text-foreground/40 border transition-colors ${errors.keyword ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={handleOptimize}
                            disabled={isOptimizing || !keyword.trim()}
                            title={tOpt('button_tooltip')}
                            aria-label={tOpt('button_tooltip')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-blue-800 dark:text-blue-300 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                        >
                            <Wand2 className={clsx("w-4 h-4", isOptimizing && "animate-pulse")} aria-hidden="true" />
                            <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-primary animate-bounce opacity-0 group-hover:opacity-100" aria-hidden="true" />
                        </button>
                    </div>

                    {optimizationInfo && (
                        <div className="mt-2 flex items-start gap-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5" aria-hidden="true" />
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-tight">
                                    {tOpt('explanation_title')}
                                </p>
                                <p className="text-xs text-foreground/80 leading-relaxed italic">
                                    {optimizationInfo.explanation}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setKeyword(optimizationInfo.original);
                                    setOptimizationInfo(null);
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                {tOpt('original')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Countries */}
                    <div className="space-y-2">
                        <span id="region-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('region')}</span>
                        <MultiSelectDropdown
                            id="region-select"
                            aria-labelledby="region-label"
                            items={countryItems}
                            selected={selectedCountries}
                            onChange={(v) => setSelectedCountries(v)}
                            placeholder={t('select_countries')}
                            searchPlaceholder={t('search_countries')}
                            selectedText={t('selected')}
                            icon={<Globe className="w-4 h-4" />}
                            renderItem={(item) => (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getCountryByCode(item.id)?.flag}</span>
                                    <span>{item.label}</span>
                                </div>
                            )}
                            renderTag={(id) => (
                                <div className="flex items-center gap-1.5">
                                    <span>{getCountryByCode(id)?.flag}</span>
                                    <span>{id}</span>
                                </div>
                            )}
                        />
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                        <span id="language-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('language')}</span>
                        <MultiSelectDropdown
                            id="language-select"
                            aria-labelledby="language-label"
                            items={languageItems}
                            selected={selectedLanguages}
                            onChange={(v) => setSelectedLanguages(v)}
                            placeholder={t('select_languages')}
                            searchPlaceholder={t('search_languages')}
                            selectedText={t('selected')}
                            icon={<Languages className="w-4 h-4" />}
                            renderItem={(item) => (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold opacity-60 uppercase">{item.id}</span>
                                    <span>{item.label}</span>
                                </div>
                            )}
                            renderTag={(id) => (
                                <span className="uppercase text-[10px] font-black">{id}</span>
                            )}
                        />
                    </div>

                    {/* Source Types */}
                    <div className="space-y-2">
                        <span id="sources-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('source_types')}</span>
                        <MultiSelectDropdown
                            id="sources-select"
                            aria-labelledby="sources-label"
                            items={sourceTypes}
                            selected={selectedSourceTypes}
                            onChange={(v) => setSelectedSourceTypes(v)}
                            placeholder={t('select_sources')}
                            searchPlaceholder={t('search_sources')}
                            selectedText={t('sources_selected')}
                            icon={<Filter className="w-4 h-4" />}
                        />
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <span id="date-range-label" className="block text-[11px] text-foreground/70 font-bold uppercase tracking-widest transition-colors px-1">{t('date_range')}</span>
                        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="date-range-label">
                            <div className="space-y-1">
                                <label htmlFor="date-from" className="sr-only">Date From</label>
                                <input
                                    id="date-from"
                                    name="date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="date-to" className="sr-only">Date To</label>
                                <input
                                    id="date-to"
                                    name="date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    autoComplete="off"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-2 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        {errorMsg && (
                            <div className="text-destructive text-xs flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                {errorMsg}
                            </div>
                        )}
                        {result && (
                            <div className="text-emerald-500 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                {t('result_success', { count: result.count ?? 0, skipped: result.skipped ?? 0, feeds: result.feeds ?? 0 })}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleGenerate}
                        isLoading={loading || authLoading || retryCountdown !== null}
                        disabled={!isAuthenticated || authLoading || retryCountdown !== null}
                        className="w-full md:w-auto font-bold px-10 py-3.5 shadow-xl shadow-primary/20 text-sm whitespace-nowrap"
                    >
                        {loading ? (
                            t('analyzing')
                        ) : retryCountdown !== null ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                {retryCountdown}s
                            </span>
                        ) : (
                            <>{t('generate_report')}</>
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}
