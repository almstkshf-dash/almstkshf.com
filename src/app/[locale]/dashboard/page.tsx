'use client';

import { useState, useEffect, useMemo, useTransition, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { Plus, Search, Filter, FileSpreadsheet, FileDown, Trash2, AlertTriangle, X, Globe, Settings, Lock, ShieldCheck, AlertCircle, Loader2, Activity, BarChart3 } from 'lucide-react';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import { DashboardGrid } from '@/components/media-pulse/DashboardGrid';
import ArticleTable from '@/components/media-pulse/ArticleTable';
import ManualEntryModal from '@/components/media-pulse/ManualEntryModal';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import NewsGenerator, { ALL_COUNTRIES } from '@/components/media-pulse/NewsGenerator';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import DeepStatusPanel from '@/components/media-pulse/DeepStatusPanel';
import OsintTab from '@/components/media-pulse/OsintTab';
import PressReleasePanel from '@/components/media-pulse/PressReleasePanel';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Button from '@/components/ui/Button';
import RssFeeder from '@/components/dashboard/RssFeeder';
import { AAWSAT_SOURCES } from '@/config/rss-sources';

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

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [isPending, startTransition] = useTransition();
    const [isManualModalOpen, setManualModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [selectedType, setSelectedType] = useState('All');
    const [selectedCountry, setSelectedCountry] = useState('All');
    
    // Initialize activeView from URL search parameters, defaulting to 'standard'
    const [activeView, setActiveView] = useState<'standard' | 'deep' | 'osint'>(
        (searchParams.get('view') as any) || 'standard'
    );

    // Sync state with URL search parameters
    useEffect(() => {
        const view = searchParams.get('view') as any;
        if (view && ['standard', 'deep', 'osint'].includes(view)) {
            setActiveView(view);
        }
    }, [searchParams]);

    const changeView = (newView: 'standard' | 'deep' | 'osint') => {
        setActiveView(newView);
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [skip, setSkip] = useState(0);
    const [loadedArticles, setLoadedArticles] = useState<ArticleItem[]>([]);

    // Sync search query with URL
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
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Admin status — determines which restricted tabs/actions are enabled
    const { isAuthenticated } = useConvexAuth();
    const isAdmin = useQuery(
        (api as any).authQueries?.checkIsAdmin,
        isAuthenticated ? {} : 'skip'
    ) ?? false;

    // Fetch Data with Filters
    const result = useQuery(api.monitoring.getArticles, {
        limit: 50,
        skip,
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
        depth: activeView === 'deep' ? 'deep' : undefined,
    }) as { items: ArticleItem[], total: number, nextSkip: number | null };

    // ── Analytics queries (these power the dashboard indicators) ──────────────────────────
    const analyticsOverview = useQuery(api.monitoring.getAnalyticsOverview, {});
    const emotionAggregates = useQuery(api.monitoring.getEmotionAggregates, {});
    const geographyAggregates = useQuery(api.monitoring.getGeographyAggregates, {});

    // Combine into a single analytics object for DashboardGrid
    const analytics = analyticsOverview ? {
        nss: analyticsOverview.nss ?? 0,
        riskScore: analyticsOverview.riskScore ?? 0,
        velocity: analyticsOverview.velocity ?? 0,
        totalReach: analyticsOverview.totalReach ?? 0,
        sentimentDistribution: analyticsOverview.sentimentDistribution ?? { Positive: 0, Neutral: 0, Negative: 0 },
        crisisProbability: analyticsOverview.crisisProbability ?? 0,
        emotions: (emotionAggregates as Record<string, number>) ?? {},
        geography: (geographyAggregates as Record<string, number>) ?? {},
    } : undefined;

    const totalArticles = result?.total || 0;

    const deleteAll = useMutation(api.monitoring.deleteAllArticles);

    const sourceTypes = [
        { id: 'All', label: t('filters.all') },
        { id: 'Online News', label: t('filters.online') },
        { id: 'Social Media', label: t('filters.social') },
        { id: 'Press Release', label: t('filters.press') },
        { id: 'Blog', label: t('filters.blog') },
        { id: 'Print', label: t('filters.print') },
    ];

    // accumulate pages
    useEffect(() => {
        if (result?.items) {
            setLoadedArticles(prev => skip === 0 ? result.items : [...prev, ...result.items]);
        }
    }, [result?.items, skip]);

    // reset when filters change
    useEffect(() => {
        setSkip(0);
        setLoadedArticles([]);
    }, [selectedType, selectedCountry, activeView]);

    // 1. Memoize filteredArticles to prevent expensive re-calculation on every render
    const filteredArticles = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return loadedArticles;

        return loadedArticles.filter((a: ArticleItem) => {
            return (
                a.title.toLowerCase().includes(query) ||
                (a.keyword && a.keyword.toLowerCase().includes(query)) ||
                (a.sourceType && a.sourceType.toLowerCase().includes(query))
            );
        });
    }, [loadedArticles, searchQuery]);

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
            console.error("Clear failed:", error);
            showToast('error', t('clear_failed'));
        } finally {
            setIsClearing(false);
        }
    };

    const tExport = useTranslations('Export');

    const topLeftSlotMemo = useMemo(() => (
        <div className="space-y-8">
            <NewsGenerator defaultSourceType="Online News" />
            <PressReleasePanel />
            <div className="flex items-center justify-between mt-6 mb-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase flex items-center gap-3 italic">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    {t('media_pulse_analytics_title') || 'Media Pulse Analytics'}
                </h2>
                <div className="h-px bg-gradient-to-r from-primary/20 via-primary/5 to-transparent flex-1 mx-8" />
            </div>
        </div>
    ), [t]);

    const topRightSlotMemo = useMemo(() => (
        <div className="sticky top-8 mb-8 z-20">
            <RssFeeder
                initialFeedUrl={isAr ? "https://aawsat.com/feed" : "https://feeds.bbci.co.uk/news/world/rss.xml"}
                initialSourceName={isAr ? "الشرق الأوسط" : "Global Intelligence (BBC)"}
                categories={isAr ? AAWSAT_SOURCES : []}
                maxItems={10}
            />
        </div>
    ), [isAr]);

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (filteredArticles.length === 0) {
            showToast('error', t('export_empty'));
            return;
        }

        // Get all Export translations as an object
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
            sentiment_pos: t('sentiment.positive'), // reuse from Dashboard if possible
            sentiment_neu: t('sentiment.neutral'),
            sentiment_neg: t('sentiment.negative'),
        };

        if (type === 'excel') {
            try {
                exportToExcel(filteredArticles, exportTranslations);
                showToast('success', t('export_success'));
            } catch { showToast('error', t('export_failed')); }
        } else {
            setIsExporting(true);
            try {
                await exportToPDF(filteredArticles, exportTranslations);
                showToast('success', t('export_success'));
            } catch (e) {
                console.error("Export failed", e);
                showToast('error', t('export_failed'));
            } finally {
                setIsExporting(false);
            }
        }
    };

    return (
        <main className="min-h-screen bg-background/50 text-foreground relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            <div className="max-w-[1536px] mx-auto p-4 md:p-8 lg:p-10 space-y-10 relative z-10">
                {/* Header Section */}
                <header className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group border-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                <Activity className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                                    {t('title')}
                                </h1>
                                <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    {t('subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 relative z-10">
                        {/* View Switcher */}
                        <div className="flex items-center p-1 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner overflow-hidden">
                            {[
                                { id: 'standard', label: t('filters.view_standard'), icon: Globe, color: 'primary' },
                                { id: 'deep', label: t('filters.view_deep'), icon: Search, color: 'status-info' },
                                { id: 'osint', label: t('filters.view_osint'), icon: ShieldCheck, color: 'status-success', restricted: !isAdmin }
                            ].map((view) => (
                                <button
                                    key={view.id}
                                    onClick={() => {
                                        if (view.restricted) return;
                                        startTransition(() => changeView(view.id as any));
                                    }}
                                    disabled={view.restricted || isPending}
                                    className={clsx(
                                        "relative flex items-center gap-2 h-10 px-5 text-xs font-black uppercase tracking-widest transition-all rounded-xl",
                                        activeView === view.id
                                            ? `bg-primary shadow-lg shadow-primary/20 text-primary-foreground`
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                        view.restricted && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                >
                                    {view.restricted ? <Lock className="w-3.5 h-3.5" /> : <view.icon className="w-3.5 h-3.5" />}
                                    {view.label}
                                    <AnimatePresence>
                                        {activeView === view.id && (
                                            <motion.div
                                                layoutId="active-view"
                                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 ml-auto xl:ml-0">
                            {/* Actions Group */}
                            <div className="flex items-center p-1 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/50">
                                <HoverPrefetchLink href="/dashboard/settings">
                                    <button
                                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                                        title={t('settings')}
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </HoverPrefetchLink>

                                <button
                                    onClick={() => setManualModalOpen(true)}
                                    className="h-10 px-4 flex items-center gap-2 rounded-xl hover:bg-muted text-foreground text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    <Plus className="w-4 h-4 text-primary" />
                                    {t('manual_entry')}
                                </button>
                            </div>

                            {/* Export Group */}
                            <div className="flex items-center p-1 bg-primary/10 backdrop-blur-md rounded-2xl border border-primary/20">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting || filteredArticles.length === 0}
                                    className="h-10 px-5 flex items-center gap-2 rounded-xl hover:bg-primary/20 text-primary text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    <FileDown className="w-4 h-4" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    disabled={filteredArticles.length === 0}
                                    className="h-10 px-5 flex items-center gap-2 rounded-xl hover:bg-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    EXCEL
                                </button>
                            </div>

                            {totalArticles > 0 && (
                                <button
                                    onClick={() => setIsClearDialogOpen(true)}
                                    className="h-[52px] px-6 rounded-2xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group"
                                >
                                    <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    {t('clear_all')}
                                </button>
                            )}
                        </div>
                    </div>
                </header>


                {activeView === 'standard' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Discovery & Analytics Section */}
                        <DashboardGrid 
                            articles={filteredArticles} 
                            analytics={analytics}
                            topLeftSlot={topLeftSlotMemo}
                            topRightSlot={topRightSlotMemo}
                        />

                        {/* Coverage Section */}
                        <section className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-primary/5 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary/10 to-primary/50" />

                            <div className="p-8 border-b border-border/50 bg-muted/20 backdrop-blur-sm space-y-6">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter italic">
                                            <div className="p-2 bg-primary/10 rounded-xl">
                                                <Filter className="w-5 h-5 text-primary" />
                                            </div>
                                            {t('coverage_log')}
                                        </h2>
                                        <p className="text-sm text-foreground/70 dark:text-slate-400 font-medium flex items-center gap-2">
                                            <span className="text-primary font-black">{totalArticles}</span>
                                            {t('total_articles_detected') || 'total articles detected in current scope'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            <select
                                                value={selectedCountry}
                                                onChange={(e) => setSelectedCountry(e.target.value)}
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
                                                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>

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

                                <div className="flex flex-wrap gap-2">
                                    {sourceTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={clsx(
                                                "inline-flex items-center h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border",
                                                selectedType === type.id
                                                    ? 'bg-primary shadow-lg shadow-primary/20 border-primary text-primary-foreground scale-105'
                                                    : 'bg-background/80 border-border/50 text-foreground/70 dark:text-slate-400 hover:bg-background hover:text-foreground hover:border-border'
                                            )}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                            <Button variant="ghost" onClick={() => { setSearchQuery(''); setSelectedType('All'); }} className="font-black uppercase tracking-widest text-[10px]">
                                                {t('reset_filters') || 'Reset All Filters'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeView === 'deep' && (
                    <>
                        <NewsGenerator defaultSourceType="Online News" />
                        <DashboardGrid articles={filteredArticles} analytics={analytics} />
                        <DeepStatusPanel />
                    </>
                )}

                {activeView === 'osint' && <OsintTab />}
            </div>

            {/* Global Overlays */}
            <ConfirmationDialog
                isOpen={isClearDialogOpen}
                onClose={() => setIsClearDialogOpen(false)}
                onConfirm={handleClearAll}
                title={t('clear_all')}
                description={t('confirm_clear_all')}
                variant="danger"
                isLoading={isClearing}
            />

            {toast && (
                <div role="status" className={clsx(
                    "fixed bottom-8 right-8 z-[50] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-500 border flex items-center gap-4 transition-all",
                    toast.type === 'success'
                        ? "bg-status-success-bg/90 text-status-success-fg border-status-success-fg/20"
                        : "bg-status-error-bg/90 text-status-error-fg border-status-error-fg/20"
                )}>
                    <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                        toast.type === 'success' ? "bg-status-success-fg/20" : "bg-status-error-fg/20"
                    )}>
                        {toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="font-bold text-sm tracking-tight leading-none mb-1">
                            {toast.type === 'success' ? t('success') : t('error')}
                        </div>
                        <div className="text-xs font-semibold opacity-90 leading-tight pr-4">
                            {toast.message}
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
            )}

            <ManualEntryModal
                isOpen={isManualModalOpen}
                onClose={() => setManualModalOpen(false)}
            />
        </main>
    );
}
