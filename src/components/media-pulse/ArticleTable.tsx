'use client';

import { useTranslations } from 'next-intl';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loader2, ExternalLink, Image as ImageIcon, Trash2, ShieldCheck, AlertCircle, HelpCircle, Globe2, Newspaper, MessageSquare, BookOpen, Printer, Heart, Share2, MessageCircle, Edit, History, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState, useMemo, memo } from 'react';
import clsx from 'clsx';

const ArticleTable = memo(function ArticleTable({ articles, limit = 50 }: { articles: any[], limit?: number }) {
    const t = useTranslations('ArticleTable');
    const deleteArticle = useMutation(api.monitoring.deleteArticle);
    const deleteArticles = useMutation(api.monitoring.deleteArticles);
    const updateSentiment = useMutation(api.monitoring.updateSentiment);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);

    const displayedArticles = useMemo(() => (articles ?? []).slice(0, limit), [articles, limit]);

    if (articles === undefined) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (articles.length === 0) {
        return null; // parent handles empty state
    }

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

    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'Press Release': return <BookOpen className="w-3 h-3" />;
            case 'Online News': return <Newspaper className="w-3 h-3" />;
            case 'Social Media': return <MessageSquare className="w-3 h-3" />;
            case 'Blog': return <Globe2 className="w-3 h-3" />;
            case 'Print': return <Printer className="w-3 h-3" />;
            default: return <Newspaper className="w-3 h-3" />;
        }
    };

    const getSourceBadgeColor = (type: string) => {
        switch (type) {
            case 'Press Release': return 'bg-status-info-bg text-status-info-fg border-status-info-fg/20';
            case 'Online News': return 'bg-status-info-bg text-status-info-fg border-status-info-fg/20';
            case 'Social Media': return 'bg-status-info-bg text-status-info-fg border-status-info-fg/20';
            case 'Blog': return 'bg-status-info-bg text-status-info-fg border-status-info-fg/20';
            case 'Print': return 'bg-status-neutral-bg text-status-neutral-fg border-status-neutral-fg/20';
            default: return 'bg-status-neutral-bg text-status-neutral-fg border-status-neutral-fg/20';
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
                                    aria-label={t('select_all')}
                                    className="rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background transition-colors"
                                />
                            </th>
                            <th className="p-4 font-bold">{t('col_date')}</th>
                            <th className="p-4 font-bold">{t('col_title')}</th>
                            <th className="p-4 font-bold">{t('col_source')}</th>
                            <th className="p-4 font-bold">{t('col_depth')}</th>
                            <th className="p-4 font-bold">{t('col_sentiment')}</th>
                            <th className="p-4 font-bold text-right">{t('col_reach')}</th>
                            <th className="p-4 font-bold text-right">{t('col_likes')}</th>
                            <th className="p-4 font-bold text-right">{t('col_retweets')}</th>
                            <th className="p-4 font-bold text-right">{t('col_replies')}</th>
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
                                        aria-label={t('select_article', { title: article.title })}
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
                                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors ${getSourceBadgeColor(article.sourceType)}`}>
                                                {getSourceIcon(article.sourceType)}
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
                                            {article.imageUrl && <ImageIcon className="w-3 h-3 text-status-info-fg/70" />}
                                            {article.isManual && (
                                                <span className="bg-status-warning-bg text-status-warning-fg border border-status-warning-fg/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter transition-colors shadow-sm">
                                                    {t('manual')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {article.source || article.sourceCountry || '—'}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${article.depth === 'deep'
                                            ? 'bg-status-info-bg text-status-info-fg border-status-info-fg/10'
                                            : 'bg-status-neutral-bg text-status-neutral-fg border-status-neutral-fg/10'}`}>
                                            {article.depth || 'standard'}
                                        </span>
                                        {article.relevancy_score !== undefined && (
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter" title={t('relevancy')}>
                                                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={clsx(
                                                            "h-full transition-all",
                                                            article.relevancy_score >= 90 ? "bg-status-success-fg" :
                                                                article.relevancy_score >= 70 ? "bg-status-info-fg" : "bg-status-warning-fg"
                                                        )}
                                                        style={{ width: `${article.relevancy_score}%` }}
                                                    />
                                                </div>
                                                <span>{article.relevancy_score}%</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="relative group/sentiment">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm border cursor-pointer hover:ring-2 hover:ring-primary/20",
                                            article.sentiment === 'Positive'
                                                ? 'bg-status-success-bg text-status-success-fg border-status-success-fg/20'
                                                : article.sentiment === 'Negative'
                                                    ? 'bg-status-error-bg text-status-error-fg border-status-error-fg/20'
                                                    : 'bg-status-neutral-bg text-status-neutral-fg border-status-neutral-fg/20'
                                        )}>
                                            {article.sentiment === 'Positive' && <ShieldCheck className="w-3 h-3" />}
                                            {article.sentiment === 'Negative' && <AlertCircle className="w-3 h-3" />}
                                            {(!article.sentiment || article.sentiment === 'Neutral') && <HelpCircle className="w-3 h-3" />}
                                            {article.sentiment === 'Positive' ? t('sentiments.positive') :
                                                article.sentiment === 'Negative' ? t('sentiments.negative') :
                                                    t('sentiments.neutral')}

                                            {article.manualSentimentOverride && (
                                                <span title={`Original: ${article.originalSentiment}`}>
                                                    <History className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                                </span>
                                            )}
                                            <Edit className="w-2.5 h-2.5 opacity-0 group-hover/sentiment:opacity-100 transition-opacity ml-1" />
                                        </div>

                                        {/* Simple Sentiment Dropdown */}
                                        <div className="absolute top-full left-0 mt-1 hidden group-hover/sentiment:block z-50 bg-background border border-border rounded-xl shadow-xl p-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-200">
                                            {(['Positive', 'Neutral', 'Negative'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    disabled={updatingId === article._id}
                                                    onClick={async () => {
                                                        if (article.sentiment === s) return;
                                                        setUpdatingId(article._id);
                                                        try {
                                                            await updateSentiment({ id: article._id, sentiment: s });
                                                        } finally {
                                                            setUpdatingId(null);
                                                        }
                                                    }}
                                                    className={clsx(
                                                        "w-full text-left rtl:text-right px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between",
                                                        s === 'Positive' ? "hover:bg-status-success-bg/30 text-status-success-fg" :
                                                            s === 'Negative' ? "hover:bg-status-error-bg/30 text-status-error-fg" :
                                                                "hover:bg-status-neutral-bg/30 text-status-neutral-fg",
                                                        article.sentiment === s && "bg-primary/10 ring-1 ring-inset ring-primary/20",
                                                        updatingId === article._id && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {s === 'Positive' ? t('sentiments.positive') :
                                                        s === 'Negative' ? t('sentiments.negative') :
                                                            t('sentiments.neutral')}
                                                    {updatingId === article._id && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right text-xs font-mono text-muted-foreground transition-colors">
                                    {article.reach?.toLocaleString() || '—'}
                                </td>
                                <td className="p-4 text-right text-xs font-mono text-muted-foreground transition-colors">
                                    {article.likes !== undefined ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="tabular-nums">{article.likes.toLocaleString()}</span>
                                            <Heart className="w-3 h-3 text-status-error-fg/70" />
                                        </div>
                                    ) : '—'}
                                </td>
                                <td className="p-4 text-right text-xs font-mono text-muted-foreground transition-colors">
                                    {article.retweets !== undefined ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="tabular-nums">{article.retweets.toLocaleString()}</span>
                                            <Share2 className="w-3 h-3 text-status-success-fg/70" />
                                        </div>
                                    ) : '—'}
                                </td>
                                <td className="p-4 text-right text-xs font-mono text-muted-foreground transition-colors">
                                    {article.replies !== undefined ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="tabular-nums">{article.replies.toLocaleString()}</span>
                                            <MessageCircle className="w-3 h-3 text-status-info-fg/70" />
                                        </div>
                                    ) : '—'}
                                </td>
                                <td className="p-4 text-right text-xs font-mono font-bold text-foreground transition-colors">
                                    ${article.ave?.toLocaleString() || '0'}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={clsx(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border transition-all",
                                        article.status === 'in_progress'
                                            ? 'bg-status-warning-bg text-status-warning-fg border-status-warning-fg/20'
                                            : 'bg-status-success-bg text-status-success-fg border-status-success-fg/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                    )}>
                                        <span className={clsx(
                                            "w-1 h-1 rounded-full mr-1.5 transition-all animate-pulse",
                                            article.status === 'in_progress' ? "bg-status-warning-fg" : "bg-status-success-fg"
                                        )} />
                                        {article.status === 'in_progress' ? t('status_in_progress') : t('status_live')}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(article._id)}
                                        isLoading={deletingId === article._id}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-8 w-8 shadow-none"
                                        title={t('delete')}
                                        aria-label={t('delete')}
                                    >
                                        {deletingId !== article._id && <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default ArticleTable;
