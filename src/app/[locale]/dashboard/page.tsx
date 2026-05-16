/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useEffect, useMemo, useTransition, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import {
    Plus, Search, Filter, FileSpreadsheet, FileDown, Trash2,
    AlertTriangle, Globe, Settings, ShieldCheck, Loader2,
    Activity, BarChart3, Rss,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { MonitoringArticle } from '@/types/reports';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { ALL_COUNTRIES } from '@/lib/countries';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Button from '@/components/ui/Button';
import { PREMIUM_SOURCES } from '@/config/rss-sources';
import { DashboardSection } from '@/components/dashboard/DashboardSection';

// ── Lazy-load heavy components ───────────────────────────────────────────────
function TabSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 border border-border/50 rounded-3xl p-6 h-[400px] bg-muted/5" />
                <div className="lg:col-span-2 border border-border/50 rounded-3xl p-6 h-[400px] bg-muted/5" />
            </div>
            <div className="glass-card rounded-[2.5rem] h-[500px] bg-muted/10" />
        </div>
    );
}

const DashboardGrid = dynamic(() => import('@/components/media-pulse/DashboardGrid'), {
    ssr: false,
    loading: () => <TabSkeleton />,
});
const NewsGenerator = dynamic(() => import('@/components/media-pulse/NewsGenerator'), { ssr: false });
const DarkWebTab = dynamic(() => import('@/components/media-pulse/DarkWebTab'), { ssr: false });
const OsintTab = dynamic(() => import('@/components/media-pulse/OsintTab'), { ssr: false });
const TerroristListTab = dynamic(() => import('@/components/media-pulse/TerroristListTab'), { ssr: false });
const AiInspectorTab = dynamic(() => import('@/components/media-pulse/AiInspectorTab'), { ssr: false });
const DeepStatusPanel = dynamic(() => import('@/components/media-pulse/DeepStatusPanel'), { ssr: false });
const ArticleTable = dynamic(() => import('@/components/media-pulse/ArticleTable'), { ssr: false });
const PressReleasePanel = dynamic(() => import('@/components/media-pulse/PressReleasePanel'), { ssr: false });
const ManualEntryModal = dynamic(() => import('@/components/media-pulse/ManualEntryModal'), { ssr: false });
const RssFeeder = dynamic(() => import('@/components/dashboard/RssFeeder'), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────────────
type ViewId = 'standard' | 'deep' | 'osint' | 'terrorist_list' | 'inspect' | 'darkweb';

type ArticleItem = MonitoringArticle;

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // ── Derive active view directly from URL — sidebar owns navigation ───────
    const activeView = ((searchParams.get('view') as ViewId) || 'standard') satisfies ViewId;
    const depthFilter: 'standard' | 'deep' = activeView === 'deep' ? 'deep' : 'standard';
    const viewDetails = useMemo(() => {
        if (activeView === 'deep') {
            return {
                label: t('view.deep_label', { defaultValue: 'Deep Investigation' }),
                title: t('view.deep_title', { defaultValue: 'Deep analysis mode' }),
                description: t('view.deep_description', { defaultValue: 'Analyze deeper content and investigative signals with enriched scoring, deep-status tracking, and long-running insights.' }),
                bullets: [
                    t('view.deep_bullet_1', { defaultValue: 'Extended source depth with deep classification' }),
                    t('view.deep_bullet_2', { defaultValue: 'Advanced risk and coverage intelligence' }),
                    t('view.deep_bullet_3', { defaultValue: 'Includes Deep Status panel and analyst alerts' }),
                ],
                icon: Search,
                badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
            };
        }

        return {
            label: t('view.standard_label', { defaultValue: 'Standard monitoring' }),
            title: t('view.standard_title', { defaultValue: 'Standard coverage mode' }),
            description: t('view.standard_description', { defaultValue: 'Monitor active coverage, press releases, and pulse analytics for day-to-day operational tracking.' }),
            bullets: [
                t('view.standard_bullet_1', { defaultValue: 'Fast overview of live media, press and news coverage' }),
                t('view.standard_bullet_2', { defaultValue: 'Summary analytics for current volume, sentiment and reach' }),
                t('view.standard_bullet_3', { defaultValue: 'Quick access to coverage logs and real-time feeds' }),
            ],
            icon: Globe,
            badgeClass: 'bg-primary/10 text-primary border-primary/20',
        };
    }, [activeView, t]);

    // ── Local UI state ────────────────────────────────────────────────────────
    const [isManualModalOpen, setManualModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('All');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [skip, setSkip] = useState(0);
    const [loadedArticles, setLoadedArticles] = useState<ArticleItem[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ── Sync search query → URL ───────────────────────────────────────────────
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchQuery) {
                params.set('q', searchQuery);
            } else {
                params.delete('q');
            }
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery, pathname, router, searchParams]);

    // ── Reset pagination when filters / view change ────────────────────────────
    useEffect(() => {
        setSkip(0);
        setLoadedArticles([]);
    }, [selectedType, selectedCountry, activeView]);

    // ── Convex data ───────────────────────────────────────────────────────────
    const appSettings = useQuery(api.settings.getSettings);
    
    const result = useQuery(api.monitoring.getArticles, {
        limit: 50,
        skip,
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
        depth: depthFilter,
    }) as { items: ArticleItem[]; total: number; nextSkip: number | null };

    const analyticsOverview = useQuery(api.monitoring.getAnalyticsOverview, {
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
        depth: depthFilter,
    });
    const emotionAggregates = useQuery(api.monitoring.getEmotionAggregates, {
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
        depth: depthFilter,
    });
    const geographyAggregates = useQuery(api.monitoring.getGeographyAggregates, {
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
        depth: depthFilter,
    });

    const analytics = useMemo(() => {
        if (!analyticsOverview) return undefined;
        const sentimentDistribution = analyticsOverview.sentimentDistribution ?? { Positive: 0, Neutral: 0, Negative: 0 };
        return {
            nss: analyticsOverview.nss ?? 0,
            riskScore: analyticsOverview.riskScore ?? 0,
            velocity: analyticsOverview.velocity ?? 0,
            totalReach: analyticsOverview.totalReach ?? 0,
            sentimentDistribution: {
                positive: sentimentDistribution.Positive ?? 0,
                neutral: sentimentDistribution.Neutral ?? 0,
                negative: sentimentDistribution.Negative ?? 0,
            },
            crisisProbability: analyticsOverview.crisisProbability ?? 0,
            emotions: (emotionAggregates as Record<string, number>) ?? {},
            geography: (geographyAggregates as Record<string, number>) ?? {},
        };
    }, [analyticsOverview, emotionAggregates, geographyAggregates]);

    // ── Accumulate paginated articles ─────────────────────────────────────────
    useEffect(() => {
        if (result?.items) {
            setLoadedArticles(prev => skip === 0 ? result.items : [...prev, ...result.items]);
        }
    }, [result?.items, skip]);

    const totalArticles = result?.total || 0;

    const filteredArticles = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return loadedArticles;
        return loadedArticles.filter((a: ArticleItem) =>
            a.title.toLowerCase().includes(query) ||
            (a.keyword && a.keyword.toLowerCase().includes(query)) ||
            (a.sourceType && a.sourceType.toLowerCase().includes(query))
        );
    }, [loadedArticles, searchQuery]);

    const deleteAll = useMutation(api.monitoring.deleteAllArticles);

    const sourceTypes = [
        { id: 'All', label: t('filters.all') },
        { id: 'Online News', label: t('filters.online') },
        { id: 'Social Media', label: t('filters.social') },
        { id: 'Press Release', label: t('filters.press') },
        { id: 'Blog', label: t('filters.blog') },
        { id: 'Print', label: t('filters.print') },
    ];

    // ── Helpers ───────────────────────────────────────────────────────────────
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleClearAll = async () => {
        setIsClearDialogOpen(false);
        setIsClearing(true);
        try {
            const res = await deleteAll({});
            setLoadedArticles([]);
            setSkip(0);
            showToast('success', t('cleared_success', { count: (res as { deleted?: number })?.deleted ?? 0 }));
        } catch (error) {
            console.error('Clear failed:', error);
            showToast('error', t('clear_failed'));
        } finally {
            setIsClearing(false);
        }
    };

    const tExport = useTranslations('Export');

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (filteredArticles.length === 0) {
            showToast('error', t('export_empty'));
            return;
        }

        const exportTranslations = {
            sheet_name: tExport('sheet_name'),
            date: tExport('date'),
            title: tExport('title'),
            url: tExport('url'),
            type: tExport('type'),
            source: tExport('source'),
            depth: tExport('depth'),
            country: tExport('country'),
            sentiment: tExport('sentiment'),
            reach: tExport('reach'),
            ave: tExport('ave'),
            brand_name: tExport('brand_name'),
            brand_tagline: tExport('brand_tagline'),
            footer_url: tExport('footer_url'),
            generated_at: tExport('generated_at', { date: '{date}' }),
            page_count: tExport('page_count', { current: '{current}', total: '{total}' }),
            report_title: tExport('report_title'),
            summary_title: tExport('summary_title'),
            sentiment_title: tExport('sentiment_title'),
            ai_recommendation: tExport('ai_recommendation'),
            total_reach: tExport('total_reach'),
            ad_value: tExport('ad_value'),
            total_articles: tExport('total_articles'),
            keyword_label: tExport('keyword_label'),
            region_label: tExport('region_label'),
            langs_label: tExport('langs_label'),
            coverage_log: tExport('coverage_log'),
            rec_high_neg: tExport('rec_high_neg'),
            rec_mod_neg: tExport('rec_mod_neg'),
            rec_healthy: tExport('rec_healthy'),
            sentiment_pos: t('sentiment.positive'),
            sentiment_neu: t('sentiment.neutral'),
            sentiment_neg: t('sentiment.negative'),
        };

        setIsExporting(true);
        setTimeout(async () => {
            if (type === 'excel') {
                try {
                    exportToExcel(filteredArticles, exportTranslations, exportTranslations.report_title);
                    showToast('success', t('export_success'));
                } catch {
                    showToast('error', t('export_failed'));
                } finally {
                    setIsExporting(false);
                }
            } else {
                try {
                    await exportToPDF(filteredArticles, exportTranslations, appSettings?.logoUrl);
                    showToast('success', t('export_success'));
                } catch (e) {
                    console.error('Export failed', e);
                    showToast('error', t('export_failed'));
                } finally {
                    setIsExporting(false);
                }
            }
        }, 16);
    };

    // ── Coverage log filter bar (reused in both standard & deep) ─────────────
    const coverageFilterBar = (
        <div className="px-5 py-4 border-b border-border/40 bg-muted/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Article count */}
                <p className="text-xs text-foreground/60 font-medium flex items-center gap-1.5">
                    <span className="text-foreground font-black tabular-nums">{totalArticles}</span>
                    {t('total_articles_detected')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Country filter */}
                    <div className="relative">
                        <Globe className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <select
                            id="dashboard-country-select"
                            aria-label={t('filters.country') || 'Select Country'}
                            value={selectedCountry}
                            onChange={(e) => startTransition(() => setSelectedCountry(e.target.value))}
                            className="w-full sm:w-[200px] appearance-none bg-background border border-border/60 rounded-xl ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 py-2.5 text-[11px] font-bold uppercase tracking-wide focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-foreground cursor-pointer"
                        >
                            <option value="All">{t('filters.all_countries')}</option>
                            {ALL_COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {isAr ? c.ar : c.en}
                                </option>
                            ))}
                        </select>
                        <div className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border/60 rounded-xl ltr:pl-9 rtl:pr-9 ltr:pr-4 rtl:pl-4 py-2.5 text-[11px] font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
                        />
                    </div>
                </div>
            </div>

            {/* Source type filter chips — uniform style */}
            <div className="flex flex-wrap gap-1.5">
                {sourceTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => startTransition(() => setSelectedType(type.id))}
                        className={clsx(
                            'inline-flex items-center h-8 px-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                            selectedType === type.id
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-background border border-border/60 text-foreground/70 hover:text-foreground hover:border-border'
                        )}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </div>
    );

    // ── Article list body ─────────────────────────────────────────────────────
    const articleListBody = (
        <div className="bg-background/30 backdrop-blur-md">
            {filteredArticles.length > 0 ? (
                <div className="animate-in fade-in duration-1000">
                    <ArticleTable articles={filteredArticles} limit={50} />
                    {result?.nextSkip !== null && (
                        <div className="flex justify-center p-12 bg-gradient-to-t from-background via-transparent to-transparent">
                            <button
                                onClick={() => setSkip(result.nextSkip || 0)}
                                className="inline-flex items-center h-14 px-10 bg-primary shadow-xl shadow-primary/30 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-primary-foreground hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
                            >
                                {t('filters.load_more')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-32 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_0%,transparent_70%)]" />
                    <div className="relative z-10 max-w-sm mx-auto space-y-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-muted/50 border border-border/50 mx-auto flex items-center justify-center shadow-xl group hover:scale-110 transition-transform duration-500">
                            <Search className="w-10 h-10 text-muted-foreground opacity-30 group-hover:opacity-60 group-hover:rotate-12 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">{t('no_results')}</h3>
                            <p className="text-sm text-muted-foreground/70 font-medium leading-relaxed">{t('no_results_hint')}</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
                            className="font-black uppercase tracking-widest text-[10px]"
                        >
                            {t('reset_filters')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-5 lg:p-6 relative z-10 flex flex-col gap-6">

            {/* ── SLIM HEADER ──────────────────────────────────────────────── */}
            <header className="glass-card p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-border/50 relative overflow-hidden">
                {/* Title + live status */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black tracking-tight text-foreground">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* Actions — unified color system */}
                <div className="flex items-center gap-2 flex-wrap relative z-10">

                    {/* Manual entry */}
                    <button
                        onClick={() => setManualModalOpen(true)}
                        className="h-9 px-3 flex items-center gap-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-[11px] font-bold uppercase tracking-widest transition-all border border-border/60"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {t('manual_entry')}
                    </button>

                    {/* Export — only for article views, unified primary color */}
                    {(activeView === 'standard' || activeView === 'deep') && (
                        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={isExporting || filteredArticles.length === 0}
                                className="h-8 px-3 flex items-center gap-1.5 rounded-lg hover:bg-primary/10 text-foreground/80 hover:text-primary text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                            >
                                {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                                {t('pdf_label')}
                            </button>
                            <div className="w-px h-5 bg-border/60" />
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={isExporting || filteredArticles.length === 0}
                                className="h-8 px-3 flex items-center gap-1.5 rounded-lg hover:bg-primary/10 text-foreground/80 hover:text-primary text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                            >
                                {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />}
                                {t('excel_label')}
                            </button>
                        </div>
                    )}

                    {/* Settings */}
                    <HoverPrefetchLink href="/dashboard/settings">
                        <button
                            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/50"
                            title={t('settings')}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </HoverPrefetchLink>

                    {/* Clear all — danger, always rightmost */}
                    {totalArticles > 0 && (
                        <button
                            onClick={() => setIsClearDialogOpen(true)}
                            className="h-9 px-3 rounded-xl bg-destructive/8 hover:bg-destructive/15 text-destructive border border-destructive/20 text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                        >
                            <Trash2 className="w-3 h-3" />
                            {t('clear_all')}
                        </button>
                    )}
                </div>
            </header>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
            {(activeView === 'standard' || activeView === 'deep') && (
                <div className="mb-8 rounded-[2rem] border border-border/50 bg-muted/70 p-6 shadow-lg shadow-black/5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground/70 mb-2">
                            {viewDetails.label}
                        </p>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                            {viewDetails.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-foreground/80 max-w-2xl">
                            {viewDetails.description}
                        </p>
                        <ul className="mt-4 grid gap-2 text-xs text-foreground/80 sm:grid-cols-2">
                            {viewDetails.bullets.map((bullet, index) => (
                                <li key={index} className="inline-flex items-start gap-2">
                                    <span className="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-foreground/20" />
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-2">
                        <span className={clsx('inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.3em]', viewDetails.badgeClass)}>
                            {activeView === 'deep' ? t('view.deep_only_badge', { defaultValue: 'Deep only' }) : t('view.standard_badge', { defaultValue: 'Standard' })}
                        </span>
                    </div>
                </div>
            </div>
            )}
            <Suspense fallback={<TabSkeleton />}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* ── STANDARD VIEW — two-zone layout ─────────────── */}
                        {activeView === 'standard' && (
                            <div className="flex flex-col xl:flex-row gap-8 items-start">

                                {/* Left: main content (~75%) */}
                                <div className="flex-1 min-w-0 flex flex-col gap-8">

                                    {/* Section: Discovery */}
                                    <DashboardSection
                                        id="discovery"
                                        title={t('section.standard_discovery', { defaultValue: t('section.discovery') })}
                                        icon={Globe}
                                        headerSlot={<span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-primary">{t('view.quick_access', { defaultValue: 'Quick access' })}</span>}
                                    >
                                        <NewsGenerator defaultSourceType="Online News" />
                                    </DashboardSection>

                                    {/* Section: Press Monitor */}
                                    <DashboardSection
                                        id="press"
                                        title={t('section.press')}
                                        icon={FileDown}
                                    >
                                        <PressReleasePanel />
                                    </DashboardSection>

                                    {/* Section: Media Pulse Analytics */}
                                    <DashboardSection
                                        id="analytics"
                                        title={t('section.analytics')}
                                        icon={BarChart3}
                                    >
                                        <DashboardGrid
                                            articles={filteredArticles}
                                            analytics={analytics}
                                        />
                                    </DashboardSection>

                                    {/* Section: Coverage Log */}
                                    <DashboardSection
                                        id="coverage"
                                        title={t('section.coverage')}
                                        icon={Filter}
                                    >
                                        <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-primary/5 relative">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary/10 to-primary/50" />
                                            {coverageFilterBar}
                                            {articleListBody}
                                        </div>
                                    </DashboardSection>
                                </div>

                                {/* Right: Live Feed Panel — sticky (~25%, xl+) */}
                                <aside className="w-full xl:w-80 shrink-0">
                                    <div className="xl:sticky xl:top-6">
                                        <DashboardSection
                                            id="live_feed"
                                            title={t('section.live_feed')}
                                            icon={Rss}
                                        >
                                            <RssFeeder
                                                initialFeedUrl={isAr ? 'https://aawsat.com/feed' : 'https://wam.ae/en/rss'}
                                                initialSourceName={isAr ? 'news' : 'wam-en'}
                                                allSources={PREMIUM_SOURCES}
                                                maxItems={10}
                                            />
                                        </DashboardSection>
                                    </div>
                                </aside>
                            </div>
                        )}

                        {/* ── DEEP VIEW ────────────────────────────────────── */}
                        {activeView === 'deep' && (
                            <div className="flex flex-col gap-8">
                                <DashboardSection
                                    id="deep-discovery"
                                    title={t('section.discovery')}
                                    icon={Search}
                                >
                                    <NewsGenerator defaultSourceType="Online News" />
                                </DashboardSection>

                                <DashboardSection
                                    id="deep-analytics"
                                    title={t('section.deep_analytics', { defaultValue: t('section.analytics') })}
                                    icon={BarChart3}
                                    headerSlot={<span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">{t('view.deep_only', { defaultValue: 'Deep-only' })}</span>}
                                >
                                    <DashboardGrid articles={filteredArticles} analytics={analytics} />
                                </DashboardSection>

                                <DashboardSection
                                    id="deep-coverage"
                                    title={t('section.coverage')}
                                    icon={Filter}
                                >
                                    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary/10 to-primary/50" />
                                        {coverageFilterBar}
                                        {articleListBody}
                                    </div>
                                    <DeepStatusPanel />
                                </DashboardSection>
                            </div>
                        )}

                        {/* ── SPECIALISED VIEWS ────────────────────────────── */}
                        {activeView === 'darkweb' && <DarkWebTab />}
                        {activeView === 'osint' && <OsintTab />}
                        {activeView === 'terrorist_list' && <TerroristListTab />}
                        {activeView === 'inspect' && <AiInspectorTab />}

                    </motion.div>
                </AnimatePresence>
            </Suspense>

            {/* ── GLOBAL OVERLAYS ──────────────────────────────────────────── */}
            <ConfirmationDialog
                isOpen={isClearDialogOpen}
                onClose={() => setIsClearDialogOpen(false)}
                onConfirm={handleClearAll}
                title={t('clear_all')}
                description={t('confirm_clear_all')}
                variant="danger"
                isLoading={isClearing}
            />

            {/* Toast */}
            {toast && (() => {
                const tst = toast;
                return (
                    <div
                        role="status"
                        className={clsx(
                            'fixed bottom-8 ltr:right-8 rtl:left-8 z-[50] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-500 border flex items-center gap-4 transition-all',
                            tst.type === 'success'
                                ? 'bg-status-success-bg/90 text-status-success-fg border-status-success-fg/20'
                                : 'bg-status-error-bg/90 text-status-error-fg border-status-error-fg/20'
                        )}
                    >
                        <div className={clsx(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg',
                            tst.type === 'success' ? 'bg-status-success-fg/20' : 'bg-status-error-fg/20'
                        )}>
                            {tst.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="font-bold text-sm tracking-tight leading-none mb-1">
                                {tst.type === 'success' ? t('success') : t('error')}
                            </div>
                            <div className="text-xs font-semibold opacity-90 leading-tight pr-4">
                                {tst.message}
                            </div>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100"
                        >
                            <Plus className="w-4 h-4 rotate-45" />
                        </button>
                        <div className="absolute inset-x-2 bottom-2 h-0.5 bg-current opacity-20 rounded-full" />
                    </div>
                );
            })()}

            <ManualEntryModal
                isOpen={isManualModalOpen}
                onClose={() => setManualModalOpen(false)}
            />
        </div>
    );
}
