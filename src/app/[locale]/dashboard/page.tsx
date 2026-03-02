'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, FileSpreadsheet, FileDown, Trash2, AlertTriangle, X, Globe, Settings } from 'lucide-react';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import Button from '@/components/ui/Button';
import { DashboardGrid } from '@/components/media-pulse/DashboardGrid';
import ArticleTable from '@/components/media-pulse/ArticleTable';
import ManualEntryModal from '@/components/media-pulse/ManualEntryModal';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import NewsGenerator, { ALL_COUNTRIES } from '@/components/media-pulse/NewsGenerator';
import clsx from 'clsx';
import { useLocale } from 'next-intl';
import DeepStatusPanel from '@/components/media-pulse/DeepStatusPanel';
import OsintTab from '@/components/media-pulse/OsintTab';
import PressReleasePanel from '@/components/media-pulse/PressReleasePanel';

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
    const [isManualModalOpen, setManualModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [activeView, setActiveView] = useState<'standard' | 'deep' | 'osint'>('standard');
    const [skip, setSkip] = useState(0);
    const [loadedArticles, setLoadedArticles] = useState<ArticleItem[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

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
        // confirm() is synchronous and blocks the main thread during interaction.
        if (!window.confirm(t('confirm_clear_all'))) return;

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

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (filteredArticles.length === 0) {
            showToast('error', t('export_empty'));
            return;
        }
        if (type === 'excel') {
            try {
                exportToExcel(filteredArticles);
                showToast('success', t('export_success'));
            } catch { showToast('error', t('export_failed')); }
        } else {
            setIsExporting(true);
            try {
                await exportToPDF(filteredArticles);
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
                {toast && (
                    <div className={clsx(
                        "fixed top-24 right-6 z-[100] px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300",
                        toast.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 shadow-emerald-900/20'
                            : 'bg-destructive/15 border-destructive/30 text-destructive dark:text-rose-300 shadow-destructive/20'
                    )}>
                        {toast.type === 'error' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToast(null)}
                            className="ml-2 hover:opacity-80 h-7 w-7"
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                )}

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                {t('title')}
                            </h1>
                            <div className="flex bg-secondary/80 rounded-full border border-border p-1 backdrop-blur-sm">
                                <Button
                                    variant={activeView === 'standard' ? 'primary' : 'ghost'}
                                    size="sm"
                                    className={clsx(
                                        "px-4 py-1.5 text-xs font-bold rounded-full h-auto transition-all",
                                        activeView !== 'standard' && "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setActiveView('standard')}
                                >
                                    {t('filters.view_standard')}
                                </Button>
                                <Button
                                    variant={activeView === 'deep' ? 'primary' : 'ghost'}
                                    size="sm"
                                    className={clsx(
                                        "px-4 py-1.5 text-xs font-bold rounded-full h-auto transition-all",
                                        activeView === 'deep' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setActiveView('deep')}
                                >
                                    {t('filters.view_deep')}
                                </Button>
                                <Button
                                    variant={activeView === 'osint' ? 'primary' : 'ghost'}
                                    size="sm"
                                    className={clsx(
                                        "px-4 py-1.5 text-xs font-bold rounded-full h-auto transition-all",
                                        activeView === 'osint' ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600' : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setActiveView('osint')}
                                >
                                    {t('filters.view_osint')}
                                </Button>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Settings Button */}
                        <HoverPrefetchLink href="/dashboard/settings" aria-label={t('settings')}>
                            <Button
                                variant="secondary"
                                className="bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-300 px-3 text-xs shadow-none h-auto w-9 flex justify-center items-center"
                                iconOnly
                                aria-label={t('settings')}
                            >
                                <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                            </Button>
                        </HoverPrefetchLink>

                        {/* Add Manual Entry */}
                        <Button
                            variant="secondary"
                            onClick={() => setManualModalOpen(true)}
                            className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 px-4 text-xs shadow-none h-auto"
                            leftIcon={<Plus className="w-3.5 h-3.5" aria-hidden="true" />}
                        >
                            {t('manual_entry')}
                        </Button>

                        {/* Clear All */}
                        {totalArticles > 0 && (
                            <Button
                                variant="danger"
                                onClick={handleClearAll}
                                isLoading={isClearing}
                                className="bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive px-4 text-xs shadow-none h-auto"
                                leftIcon={!isClearing && <Trash2 className="w-3.5 h-3.5" />}
                            >
                                {t('clear_all')}
                            </Button>
                        )}

                        {/* Vertical Divider */}
                        <div className="w-px h-8 bg-border mx-1" />

                        {/* Export Buttons */}
                        <div className="flex bg-muted/50 rounded-xl border border-border p-0.5">
                            <Button
                                variant="ghost"
                                onClick={() => handleExport('pdf')}
                                isLoading={isExporting}
                                disabled={filteredArticles.length === 0}
                                className="px-3 hover:bg-background text-xs text-muted-foreground hover:text-foreground shadow-none h-auto"
                                leftIcon={!isExporting && <FileDown className="w-3.5 h-3.5" />}
                            >
                                {t('filters.export_pdf')}
                            </Button>
                            <div className="w-px bg-border my-1" />
                            <Button
                                variant="ghost"
                                onClick={() => handleExport('excel')}
                                disabled={filteredArticles.length === 0}
                                className="px-3 hover:bg-background text-xs text-muted-foreground hover:text-foreground shadow-none h-auto"
                                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                            >
                                {t('filters.export_excel')}
                            </Button>
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
                                        <Button
                                            key={type.id}
                                            variant={selectedType === type.id ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => setSelectedType(type.id)}
                                            className={clsx(
                                                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border h-auto",
                                                selectedType === type.id
                                                    ? 'bg-primary/10 border-primary/30 text-primary shadow-none'
                                                    : 'bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground shadow-none'
                                            )}
                                        >
                                            {type.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {filteredArticles.length > 0 ? (
                                <>
                                    <ArticleTable articles={filteredArticles} limit={50} />
                                    {result?.nextSkip !== null && (
                                        <div className="flex justify-center py-4">
                                            <Button
                                                variant="secondary"
                                                onClick={() => setSkip(result.nextSkip || 0)}
                                                className="px-4 py-2 bg-muted border border-border rounded-lg text-sm font-bold hover:bg-background h-auto"
                                            >
                                                {t('filters.load_more')}
                                            </Button>
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

                {activeView === 'osint' && (
                    <OsintTab />
                )}

                {/* Modals */}
                <ManualEntryModal
                    isOpen={isManualModalOpen}
                    onClose={() => setManualModalOpen(false)}
                />
            </div>
        </main>
    );
}
