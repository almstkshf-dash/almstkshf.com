'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, Loader2, FileSpreadsheet, FileDown, Trash2, AlertTriangle, X, Globe } from 'lucide-react';
import { DashboardGrid } from '@/components/media-pulse/DashboardGrid';
import ArticleTable from '@/components/media-pulse/ArticleTable';
import ManualEntryModal from '@/components/media-pulse/ManualEntryModal';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import NewsGenerator, { ALL_COUNTRIES } from '@/components/media-pulse/NewsGenerator';
import clsx from 'clsx';
import { useLocale } from 'next-intl';

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const [isManualModalOpen, setManualModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Fetch Data with Filters
    const articles = useQuery(api.monitoring.getArticles, {
        limit: 1000,
        sourceType: selectedType === 'All' ? undefined : selectedType,
        sourceCountry: selectedCountry === 'All' ? undefined : selectedCountry,
    }) || [];

    const deleteAll = useMutation(api.monitoring.deleteAllArticles);

    const sourceTypes = [
        { id: 'All', label: t('filters.all') },
        { id: 'Online News', label: t('filters.online') },
        { id: 'Social Media', label: t('filters.social') },
        { id: 'Press Release', label: t('filters.press') },
        { id: 'Blog', label: t('filters.blog') },
        { id: 'Print', label: t('filters.print') },
    ];

    // Additional Client-Side Search Filtering
    const filteredArticles = articles.filter((a: any) => {
        const matchesSearch = !searchQuery ||
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.keyword?.toLowerCase().includes(searchQuery.toLowerCase()) || // keyword might be missing in old data
            (a.sourceType && a.sourceType.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSearch;
    });

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleClearAll = async () => {
        if (!confirm(t('confirm_clear_all'))) return;
        setIsClearing(true);
        try {
            const res = await deleteAll({});
            showToast('success', t('cleared_success', { count: (res as any)?.deleted || 0 }));
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
            } catch (e) { showToast('error', t('export_failed')); }
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
        <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Add Manual Entry */}
                        <button
                            onClick={() => setManualModalOpen(true)}
                            className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-600 dark:text-amber-300 px-4 py-2.5 rounded-xl transition-all font-bold text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {t('manual_entry')}
                        </button>

                        {/* Clear All */}
                        {articles.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                disabled={isClearing}
                                className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive px-4 py-2.5 rounded-xl transition-all font-bold text-xs disabled:opacity-40"
                            >
                                {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                {t('clear_all')}
                            </button>
                        )}

                        {/* Vertical Divider */}
                        <div className="w-px h-8 bg-border mx-1" />

                        {/* Export Buttons */}
                        <div className="flex bg-muted/50 rounded-xl border border-border p-0.5">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={isExporting || filteredArticles.length === 0}
                                className="px-3 py-2 hover:bg-background rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                                PDF
                            </button>
                            <div className="w-px bg-border my-1" />
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={filteredArticles.length === 0}
                                className="px-3 py-2 hover:bg-background rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                Excel
                            </button>
                        </div>
                    </div>
                </header>

                {/* Generator Engine */}
                <NewsGenerator />

                {/* Metrics & Charts */}
                <DashboardGrid articles={filteredArticles} />

                {/* Database / Articles Section */}
                <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border space-y-4">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 text-nowrap">
                                <Filter className="w-4 h-4 text-primary" />
                                {t('coverage_log')}
                                <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded-full ml-1 border border-primary/20 font-bold">
                                    {filteredArticles.length}
                                </span>
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                {/* Country Filter */}
                                <div className="relative min-w-[180px]">
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
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

                                {/* Search Input */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder={t('search_placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-1.5">
                            {sourceTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={clsx(
                                        "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
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
                        <ArticleTable articles={filteredArticles} limit={50} />
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

                {/* Modals */}
                <ManualEntryModal
                    isOpen={isManualModalOpen}
                    onClose={() => setManualModalOpen(false)}
                />
            </div>
        </main>
    );
}
