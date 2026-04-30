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
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { ALL_COUNTRIES } from '@/components/media-pulse/NewsGenerator';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Button from '@/components/ui/Button';
import { AAWSAT_SOURCES } from '@/config/rss-sources';
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

type ArticleItem = {
    _id: string;
    title: string;
    keyword?: string;
    sourceType?: string;
    sourceCountry?: string;
    publishedDate?: string;
    sentiment?: string;
    url?: string;
    [key: string]: unknown;
};

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
    const result = useQuery(api.monitoring.getArticles, {
        limit: 50,
        skip,
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
        depth: activeView === 'deep' ? 'deep' : undefined,
    }) as { items: ArticleItem[]; total: number; nextSkip: number | null };

    const analyticsOverview = useQuery(api.monitoring.getAnalyticsOverview, {});
    const emotionAggregates = useQuery(api.monitoring.getEmotionAggregates, {});
    const geographyAggregates = useQuery(api.monitoring.getGeographyAggregates, {});

    const analytics = useMemo(() => {
        if (!analyticsOverview) return undefined;
        return {
            nss: analyticsOverview.nss ?? 0,
            riskScore: analyticsOverview.riskScore ?? 0,
            velocity: analyticsOverview.velocity ?? 0,
            totalReach: analyticsOverview.totalReach ?? 0,
            sentimentDistribution: analyticsOverview.sentimentDistribution ?? { Positive: 0, Neutral: 0, Negative: 0 },
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
                    await exportToPDF(filteredArticles, exportTranslations);
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
        <div className="p-6 md:p-8 border-b border-border/50 bg-muted/20 backdrop-blur-sm space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm text-foreground/70 font-medium flex items-center gap-2">
                        <span className="text-blue-800 dark:text-blue-300 font-black">{totalArticles}</span>
                        {t('total_articles_detected')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Country filter */}
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <select
                            id="dashboard-country-select"
                            aria-label={t('filters.country') || 'Select Country'}
                            value={selectedCountry}
                            onChange={(e) => startTransition(() => setSelectedCountry(e.target.value))}
                            className="w-full sm:w-[220px] appearance-none bg-background/50 border border-border/50 rounded-2xl pl-11 pr-10 py-3.5 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all text-foreground cursor-pointer hover:bg-background"
                        >
                            <option value="All">{t('filters.all_countries')}</option>
                            {ALL_COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {isAr ? c.ar : c.en}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-80 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 rounded-lg text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                            <Search className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background/50 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-foreground/50 text-foreground"
                        />
                    </div>
                </div>
            </div>

            {/* Source type chips */}
            <div className="flex flex-wrap gap-2">
                {sourceTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => startTransition(() => setSelectedType(type.id))}
                        className={clsx(
                            'inline-flex items-center h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border',
                            selectedType === type.id
                                ? 'bg-primary shadow-lg shadow-primary/20 border-primary text-primary-foreground scale-105'
                                : 'bg-background hover:bg-muted border-border/50 text-foreground/80 dark:text-slate-200 hover:text-foreground hover:border-border'
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
        <div className="p-4 md:p-6 lg:p-8 relative z-10 flex flex-col gap-8">

            {/* ── SLIM HEADER ──────────────────────────────────────────────── */}
            <header className="glass-card p-5 md:p-6 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border-primary/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                {/* Title + status */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
                        <Activity className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground text-xs font-medium flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap relative z-10">
                    {/* Settings */}
                    <HoverPrefetchLink href="/dashboard/settings">
                        <button
                            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all border border-border/50"
                            title={t('settings')}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </HoverPrefetchLink>

                    {/* Manual entry */}
                    <button
                        onClick={() => setManualModalOpen(true)}
                        className="h-10 px-4 flex items-center gap-2 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-black uppercase tracking-widest transition-all border border-border/50"
                    >
                        <Plus className="w-4 h-4 text-primary" />
                        {t('manual_entry')}
                    </button>

                    {/* Export — only for article views */}
                    {(activeView === 'standard' || activeView === 'deep') && (
                        <div className="flex items-center p-1 bg-primary/10 rounded-2xl border border-primary/20">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={isExporting || filteredArticles.length === 0}
                                className="h-9 px-4 flex items-center gap-2 rounded-xl hover:bg-primary/20 text-primary dark:text-blue-400 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                                {t('pdf_label')}
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={isExporting || filteredArticles.length === 0}
                                className="h-9 px-4 flex items-center gap-2 rounded-xl hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                                {t('excel_label')}
                            </button>
                        </div>
                    )}

                    {/* Clear all */}
                    {totalArticles > 0 && (
                        <button
                            onClick={() => setIsClearDialogOpen(true)}
                            className="h-10 px-4 rounded-2xl bg-destructive/10 hover:bg-destructive/20 text-rose-600 dark:text-rose-400 border border-destructive/20 text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 group/del"
                        >
                            <Trash2 className="w-3.5 h-3.5 group-hover/del:rotate-12 transition-transform" />
                            {t('clear_all')}
                        </button>
                    )}
                </div>
            </header>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
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
                                        title={t('section.discovery')}
                                        icon={Globe}
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
                                                initialFeedUrl={isAr ? 'https://aawsat.com/feed' : 'https://feeds.bbci.co.uk/news/world/rss.xml'}
                                                initialSourceName={isAr ? 'main' : 'global_intel_bbc'}
                                                categories={isAr ? AAWSAT_SOURCES : []}
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
                                    title={t('section.analytics')}
                                    icon={BarChart3}
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
