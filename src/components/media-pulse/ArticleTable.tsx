/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useTranslations } from 'next-intl';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Trash2, FolderPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import SaveToCollectionModal from '@/components/ui/SaveToCollectionModal';
import { useState, useMemo, memo, useCallback } from 'react';
import { MonitoringArticle } from '@/types/reports';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { ArticleRow, ArticleRowSkeleton } from './ArticleRow';
import { useMounted } from '@/hooks/useMounted';

const ArticleTable = memo(function ArticleTable({
    articles,
    isLoading,
    limit,
    onEditClick
}: {
    articles: MonitoringArticle[],
    isLoading?: boolean,
    limit?: number,
    onEditClick?: (article: MonitoringArticle) => void
}) {
    const t = useTranslations('ArticleTable');
    const tCommon = useTranslations('Common');
    const deleteArticle = useMutation(api.monitoring.deleteArticle);
    const deleteArticles = useMutation(api.monitoring.deleteArticles);
    const updateSentiment = useMutation(api.monitoring.updateSentiment);

    const mounted = useMounted();
    const [deletingId, setDeletingId] = useState<Id<"media_monitoring_articles"> | null>(null);
    const [updatingId, setUpdatingId] = useState<Id<"media_monitoring_articles"> | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<Id<"media_monitoring_articles">>>(new Set());
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);
    const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
    const [singleDeleteId, setSingleDeleteId] = useState<Id<"media_monitoring_articles"> | null>(null);

    // Save to collection modal states
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [itemToSave, setItemToSave] = useState<any>(undefined);
    const [itemsToSave, setItemsToSave] = useState<any[]>([]);

    const mapArticleToCollectionItem = useCallback((article: MonitoringArticle) => ({
        id: article._id,
        type: "media_monitoring" as const,
        title: article.title,
        sourceId: article.sourceCountry,
        data: {}
    }), []);

    const displayedArticles = useMemo(() => {
        if (limit === undefined) return articles ?? [];
        return (articles ?? []).slice(0, limit);
    }, [articles, limit]);

    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === displayedArticles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedArticles.map(a => a._id)));
        }
    }, [displayedArticles, selectedIds.size]);

    const toggleSelect = useCallback((id: Id<"media_monitoring_articles">) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleDelete = async (articleId: Id<"media_monitoring_articles">) => {
        setSingleDeleteId(null);
        setDeletingId(articleId);
        try {
            await deleteArticle({ id: articleId });
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(articleId);
                return next;
            });
            toast.success(tCommon('success') || 'Article deleted successfully');
        } catch (error) {
            console.error("Failed to delete:", error);
            toast.error(tCommon('error') || 'Failed to delete article');
        } finally {
            setDeletingId(null);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        setIsBatchDialogOpen(false);
        setIsBatchDeleting(true);
        try {
            await deleteArticles({ ids: Array.from(selectedIds) });
            setSelectedIds(new Set());
            toast.success(tCommon('success') || 'Articles deleted successfully');
        } catch (error) {
            console.error("Batch delete failed:", error);
            toast.error(tCommon('error') || 'Failed to delete articles');
        } finally {
            setIsBatchDeleting(false);
        }
    };

    const handleSentimentUpdate = useCallback(async (id: Id<"media_monitoring_articles">, sentiment: "Positive" | "Neutral" | "Negative") => {
        setUpdatingId(id);
        try {
            await updateSentiment({ id, sentiment });
            toast.success(tCommon('success') || 'Sentiment updated successfully');
        } catch (error) {
            console.error("Failed to update sentiment:", error);
            toast.error(tCommon('error') || 'Failed to update sentiment');
        } finally {
            setUpdatingId(null);
        }
    }, [updateSentiment, tCommon]);

    if (articles === undefined || isLoading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                    <thead>
                        <tr className="border-b border-border text-foreground/80 text-[10px] uppercase tracking-[0.2em] bg-muted/50 transition-colors">
                            <th scope="col" className="p-4 w-10">
                                <input
                                    id="select-all-articles-skeleton"
                                    name="select_all_articles"
                                    type="checkbox"
                                    disabled
                                    className="rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background transition-colors opacity-50"
                                />
                            </th>
                            <th scope="col" className="p-4 font-bold">{t('col_date')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_title')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_source')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_depth')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_sentiment')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_reach')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_likes')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_retweets')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_replies')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_ave')}</th>
                            <th scope="col" className="p-4 font-bold text-center">{t('col_status')}</th>
                            <th scope="col" className="p-4 font-bold text-center w-12">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <ArticleRowSkeleton key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (articles.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Batch Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-primary/10 border-y border-primary/20 backdrop-blur-md animate-slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                            {t('items_selected', { count: selectedIds.size })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                const selectedArticles = displayedArticles.filter(a => selectedIds.has(a._id));
                                setItemsToSave(selectedArticles.map(mapArticleToCollectionItem));
                                setItemToSave(undefined);
                                setIsSaveModalOpen(true);
                            }}
                            className="gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/25 h-auto transition-all"
                            leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
                        >
                            {tCommon('save_to_collection')}
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setIsBatchDialogOpen(true)}
                            isLoading={isBatchDeleting}
                            className="gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-bold shadow-lg shadow-destructive/25 h-auto transition-all"
                            leftIcon={!isBatchDeleting && <Trash2 className="w-3.5 h-3.5" />}
                        >
                            {t('delete_selected', { count: selectedIds.size })}
                        </Button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                    <thead>
                        <tr className="border-b border-border text-foreground/80 text-[10px] uppercase tracking-[0.2em] bg-muted/50 transition-colors">
                            <th scope="col" className="p-4 w-10">
                                <input
                                    id="select-all-articles"
                                    name="select_all_articles"
                                    type="checkbox"
                                    checked={selectedIds.size === displayedArticles.length && displayedArticles.length > 0}
                                    onChange={toggleSelectAll}
                                    aria-label={t('select_all')}
                                    className="rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background transition-colors"
                                />
                            </th>
                            <th scope="col" className="p-4 font-bold">{t('col_date')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_title')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_source')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_depth')}</th>
                            <th scope="col" className="p-4 font-bold">{t('col_sentiment')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_reach')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_likes')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_retweets')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_replies')}</th>
                            <th scope="col" className="p-4 font-bold text-right rtl:text-left">{t('col_ave')}</th>
                            <th scope="col" className="p-4 font-bold text-center">{t('col_status')}</th>
                            <th scope="col" className="p-4 font-bold text-center w-12">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {displayedArticles.map((article) => (
                            <ArticleRow
                                key={article._id}
                                article={article}
                                isSelected={selectedIds.has(article._id)}
                                isDeleting={deletingId === article._id}
                                isUpdating={updatingId === article._id}
                                onToggleSelect={toggleSelect}
                                onDeleteClick={(id) => setSingleDeleteId(id)}
                                onEditClick={onEditClick || (() => { })}
                                onSaveClick={(art) => {
                                    setItemToSave(mapArticleToCollectionItem(art));
                                    setItemsToSave([]);
                                    setIsSaveModalOpen(true);
                                }}
                                onUpdateSentiment={handleSentimentUpdate}
                                t={t}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={!!singleDeleteId}
                onClose={() => setSingleDeleteId(null)}
                onConfirm={() => singleDeleteId && handleDelete(singleDeleteId)}
                title={t('confirm_delete')}
                description={t('confirm_delete_desc')}
                variant="danger"
                isLoading={!!deletingId}
            />

            <ConfirmationDialog
                isOpen={isBatchDialogOpen}
                onClose={() => setIsBatchDialogOpen(false)}
                onConfirm={handleBatchDelete}
                title={t('confirm_delete_selected', { count: selectedIds.size })}
                description={t('confirm_delete_selected_desc', { count: selectedIds.size })}
                variant="danger"
                isLoading={isBatchDeleting}
            />

            {isSaveModalOpen && (
                <SaveToCollectionModal
                    isOpen={isSaveModalOpen}
                    onClose={() => {
                        setIsSaveModalOpen(false);
                        setItemToSave(undefined);
                        setItemsToSave([]);
                    }}
                    item={itemToSave}
                    items={itemsToSave.length > 0 ? itemsToSave : undefined}
                />
            )}
        </div>
    );
});

export default ArticleTable;
