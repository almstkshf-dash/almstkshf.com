'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, FileSpreadsheet, FileDown, Trash2, AlertTriangle, X, Globe, Settings, Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import { DashboardGrid } from '@/components/media-pulse/DashboardGrid';
import ArticleTable from '@/components/media-pulse/ArticleTable';
import ManualEntryModal from '@/components/media-pulse/ManualEntryModal';
import { useMutation, useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import NewsGenerator, { ALL_COUNTRIES } from '@/components/media-pulse/NewsGenerator';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
import DeepStatusPanel from '@/components/media-pulse/DeepStatusPanel';
import OsintTab from '@/components/media-pulse/OsintTab';
import PressReleasePanel from '@/components/media-pulse/PressReleasePanel';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Button from '@/components/ui/Button';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [activeView, setActiveView] = useState<'standard' | 'deep' | 'osint'>('standard');
    const [skip, setSkip] = useState(0);
    const [loadedArticles, setLoadedArticles] = useState<ArticleItem[]>([]);
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
        <main className="min-h-screen bg-background text-foreground">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">

                {/* Toast Notification */}


                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
                    </div>

                    {/* View Switcher — centered on mobile, inline on desktop */}
                    <div className="flex items-center bg-muted/50 rounded-lg border border-border shadow-sm overflow-hidden">
                        <button
                            onClick={() => startTransition(() => setActiveView('standard'))}
                            className={clsx(
                                "inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                activeView === 'standard'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                isPending && "opacity-70 cursor-wait"
                            )}
                        >
                            {t('filters.view_standard')}
                        </button>
                        <div className="w-px h-5 bg-border flex-shrink-0" />
                        <button
                            onClick={() => startTransition(() => setActiveView('deep'))}
                            className={clsx(
                                "inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                activeView === 'deep'
                                    ? 'bg-status-info-bg text-status-info-fg font-bold shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                isPending && "opacity-70 cursor-wait"
                            )}
                        >
                            {t('filters.view_deep')}
                        </button>
                        <div className="w-px h-5 bg-border flex-shrink-0" />
                        <button
                            onClick={() => {
                                if (isAdmin) {
                                    startTransition(() => setActiveView('osint'));
                                }
                            }}
                            title={!isAdmin ? 'OSINT features require admin privileges' : undefined}
                            className={clsx(
                                "inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                activeView === 'osint'
                                    ? 'bg-status-success-bg text-status-success-fg font-bold shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                (!isAdmin || isPending) && "opacity-70 cursor-wait",
                                !isAdmin && "cursor-not-allowed"
                            )}
                        >
                            {!isAdmin && <Lock className="w-3 h-3 opacity-60" />}
                            {t('filters.view_osint')}
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Settings — icon-only, consistent h-9 w-9 */}
                        <HoverPrefetchLink href="/dashboard/settings" aria-label={t('settings')}>
                            <button
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                                aria-label={t('settings')}
                            >
                                <Settings className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </HoverPrefetchLink>

                        {/* Manual Entry */}
                        <button
                            onClick={() => setManualModalOpen(true)}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                            {t('manual_entry')}
                        </button>

                        {/* Clear All — only shown when articles exist */}
                        {totalArticles > 0 && (
                            <Button
                                variant="danger"
                                onClick={() => setIsClearDialogOpen(true)}
                                disabled={isClearing || totalArticles === 0}
                                isLoading={isClearing}
                                className="h-9 px-3.5 rounded-lg border border-status-error-fg/20 bg-status-error-bg text-status-error-fg text-xs font-semibold shadow-sm"
                                leftIcon={!isClearing && <Trash2 className="w-3.5 h-3.5" />}
                            >
                                {t('clear_all')}
                            </Button>
                        )}

                        {/* Vertical Divider */}
                        <div className="w-px h-6 bg-border mx-0.5" />

                        {/* Export Buttons — segmented group matching view-switcher style */}
                        <div className="flex items-center bg-muted/50 rounded-lg border border-border shadow-sm overflow-hidden">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={isExporting || filteredArticles.length === 0}
                                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {isExporting
                                    ? <span className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                                    : <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
                                }
                                {t('filters.export_pdf')}
                            </button>
                            <div className="w-px h-5 bg-border flex-shrink-0" />
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={filteredArticles.length === 0}
                                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
                                {t('filters.export_excel')}
                            </button>
                        </div>

                    </div>
                </header>

                {activeView === 'standard' && (
                    <>
                        <NewsGenerator defaultSourceType="Online News" />
                        <PressReleasePanel />
                        <DashboardGrid articles={filteredArticles} analytics={analytics} />
                        <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-border space-y-4">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2 text-nowrap">
                                        <Filter className="w-4 h-4 text-primary" />
                                        {t('coverage_log')}
                                        <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded-full ml-1 border border-primary/20 font-bold">
                                            {mounted ? `${filteredArticles.length}/${totalArticles}` : '0/0'}
                                        </span>
                                    </h2>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                        <div className="relative min-w-[180px]">
                                            <select
                                                value={selectedCountry}
                                                onChange={(e) => setSelectedCountry(e.target.value)}
                                                id="country-select"
                                                name="country"
                                                autoComplete="country"
                                                aria-label={t('filters.all_countries')}
                                                className="w-full appearance-none bg-muted/50 border border-border rounded-xl pl-10 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all text-foreground cursor-pointer hover:bg-muted font-medium"
                                            >
                                                <option value="All">{t('filters.all_countries')}</option>
                                                {ALL_COUNTRIES.map((c) => (
                                                    <option key={c.code} value={c.code}>
                                                        {isAr ? c.ar : c.en} ({c.code})
                                                    </option>
                                                ))}
                                            </select>
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>

                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                name="search"
                                                id="search-input"
                                                autoComplete="off"
                                                placeholder={t('search_placeholder')}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground text-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {sourceTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={clsx(
                                                "inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-bold transition-all border",
                                                selectedType === type.id
                                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                                    : 'bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                            )}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredArticles.length > 0 ? (
                                <>
                                    <ArticleTable articles={filteredArticles} limit={50} />
                                    {result?.nextSkip !== null && (
                                        <div className="flex justify-center py-4">
                                            <button
                                                onClick={() => setSkip(result.nextSkip || 0)}
                                                className="inline-flex items-center h-9 px-5 bg-muted border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                {t('filters.load_more')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-muted border border-border mx-auto mb-4 flex items-center justify-center">
                                        <Search className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">{t('no_results')}</p>
                                    <p className="text-muted-foreground/70 text-xs mt-1">{t('no_results_hint')}</p>
                                </div>
                            )}
                        </section>
                    </>
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
