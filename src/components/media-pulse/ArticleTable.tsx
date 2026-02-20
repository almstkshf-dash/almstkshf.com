'use client';

import { useTranslations } from 'next-intl';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2, ExternalLink, Image as ImageIcon, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import clsx from 'clsx';

export default function ArticleTable({ articles, limit = 50 }: { articles: any[], limit?: number }) {
    const t = useTranslations('ArticleTable');
    const deleteArticle = useMutation(api.monitoring.deleteArticle);
    const deleteArticles = useMutation(api.monitoring.deleteArticles);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);

    if (articles === undefined) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (articles.length === 0) {
        return null; // parent handles empty state
    }

    const displayedArticles = articles.slice(0, limit);

    const toggleSelectAll = () => {
        if (selectedIds.size === displayedArticles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedArticles.map(a => a._id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleDelete = async (articleId: string) => {
        if (!confirm(t('confirm_delete'))) return;
        setDeletingId(articleId);
        try {
            await deleteArticle({ id: articleId as any });
            const next = new Set(selectedIds);
            next.delete(articleId);
            setSelectedIds(next);
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(t('confirm_delete_selected', { count: selectedIds.size }))) return;

        setIsBatchDeleting(true);
        try {
            await deleteArticles({ ids: Array.from(selectedIds) as any });
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Batch delete failed:", error);
        } finally {
            setIsBatchDeleting(false);
        }
    };

    const getSourceBadgeColor = (type: string) => {
        switch (type) {
            case 'Press Release': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/50';
            case 'Online News': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50';
            case 'Social Media': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200/50';
            case 'Blog': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200/50';
            case 'Print': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200/50';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200/50';
        }
    };

    return (
        <div className="space-y-4">
            {/* Batch Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-primary/10 border-y border-primary/20 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                            {t('items_selected', { count: selectedIds.size })}
                        </span>
                    </div>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={handleBatchDelete}
                        isLoading={isBatchDeleting}
                        className="gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-bold shadow-lg shadow-destructive/25 h-auto"
                        leftIcon={!isBatchDeleting && <Trash2 className="w-3.5 h-3.5" />}
                    >
                        {t('delete_selected', { count: selectedIds.size })}
                    </Button>
                </div>
            )}

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-[0.2em] bg-muted/50 transition-colors">
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === displayedArticles.length && displayedArticles.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background transition-colors"
                                />
                            </th>
                            <th className="p-4 font-bold">{t('col_date')}</th>
                            <th className="p-4 font-bold">{t('col_title')}</th>
                            <th className="p-4 font-bold">{t('col_source')}</th>
                            <th className="p-4 font-bold">{t('col_depth')}</th>
                            <th className="p-4 font-bold">{t('col_sentiment')}</th>
                            <th className="p-4 font-bold text-right">{t('col_reach')}</th>
                            <th className="p-4 font-bold text-right">{t('col_ave')}</th>
                            <th className="p-4 font-bold text-center">{t('col_status')}</th>
                            <th className="p-4 font-bold text-center w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {displayedArticles.map((article: any) => (
                            <tr
                                key={article._id}
                                className={clsx(
                                    "hover:bg-muted/30 transition-colors group",
                                    selectedIds.has(article._id) && "bg-primary/5"
                                )}
                            >
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(article._id)}
                                        onChange={() => toggleSelect(article._id)}
                                        className="rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background transition-colors"
                                    />
                                </td>
                                <td className="p-4 whitespace-nowrap text-xs font-mono text-muted-foreground transition-colors">
                                    {article.publishedDate}
                                </td>
                                <td className="p-4 max-w-sm">
                                    <div className="flex flex-col gap-1 items-start rtl:items-end">
                                        <a
                                            href={article.resolvedUrl || article.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                                            dir="auto"
                                        >
                                            <span className="line-clamp-2 md:line-clamp-1">{article.title}</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                                        </a>
                                        <div className="flex items-center gap-2 flex-wrap" dir="auto">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors ${getSourceBadgeColor(article.sourceType)}`}>
                                                {article.sourceType === 'Press Release' ? t('types.press_release') :
                                                    article.sourceType === 'Online News' ? t('types.online_news') :
                                                        article.sourceType === 'Social Media' ? t('types.social_media') :
                                                            article.sourceType === 'Blog' ? t('types.blog') :
                                                                article.sourceType === 'Print' ? t('types.print') :
                                                                    article.sourceType}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                {article.sourceCountry || article.country}
                                            </span>
                                            {article.imageUrl && <ImageIcon className="w-3 h-3 text-primary/50" />}
                                            {article.isManual && <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 px-1.5 rounded text-[10px] font-bold uppercase tracking-tighter transition-colors">{t('manual')}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {article.source || article.sourceCountry || '—'}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${article.depth === 'deep'
                                        ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30'
                                        : 'bg-muted text-muted-foreground border border-border'}`}>
                                        {article.depth || 'standard'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={clsx(
                                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                        article.sentiment === 'Positive'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                            : article.sentiment === 'Negative'
                                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                                : 'bg-primary/10 text-primary border border-primary/20'
                                    )}>
                                        {article.sentiment === 'Positive' ? t('sentiments.positive') :
                                            article.sentiment === 'Negative' ? t('sentiments.negative') :
                                                t('sentiments.neutral')}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-xs font-mono text-muted-foreground transition-colors">
                                    {article.reach.toLocaleString()}
                                </td>
                                <td className="p-4 text-right text-xs font-mono font-bold text-foreground transition-colors">
                                    ${article.ave.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </td>
                                <td className="p-4 text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(article._id)}
                                        isLoading={deletingId === article._id}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8 shadow-none"
                                        title={t('delete')}
                                    >
                                        {!deletingId === article._id && <Trash2 className="w-3.5 h-3.5" />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
