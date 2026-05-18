/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { X, Trash2, ExternalLink, Download, Search, FileText, Calendar, Loader2, AlertCircle } from "lucide-react";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ReportGenerator } from "@/lib/report-generator";

interface CollectionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: Id<"collections">;
}

export default function CollectionDetailsModal({ isOpen, onClose, collectionId }: CollectionDetailsModalProps) {
    const tCommon = useTranslations("Common");
    const tLibrary = useTranslations("MediaMonitoring.central_media_repository.library");
    const tExport = useTranslations("Export");
    
    const collection = useQuery(api.collections.getCollection, { id: collectionId });
    const removeFromCollection = useMutation(api.collections.removeFromCollection);
    const deleteCollection = useMutation(api.collections.deleteCollection);
    const settings = useQuery(api.settings.getSettings);

    const [searchTerm, setSearchTerm] = useState("");
    const [removingItemId, setRemovingItemId] = useState<string | null>(null);
    const [isDeletingCollection, setIsDeletingCollection] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!isOpen) return null;

    const items = collection?.items || [];
    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.data && typeof item.data.content === "string" && item.data.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRemoveItem = async (itemId: string) => {
        setRemovingItemId(itemId);
        try {
            await removeFromCollection({ collectionId, itemId });
            toast.success(tCommon("success") || "Item removed");
        } catch (error) {
            console.error("Failed to remove item", error);
            toast.error(tCommon("error") || "Failed to remove item");
        } finally {
            setRemovingItemId(null);
        }
    };

    const handleDeleteCollection = async () => {
        setIsDeletingCollection(true);
        try {
            await deleteCollection({ id: collectionId });
            toast.success(tCommon("success") || "Collection deleted");
            onClose();
        } catch (error) {
            console.error("Failed to delete collection", error);
            toast.error(tCommon("error") || "Failed to delete collection");
            setIsDeletingCollection(false);
        }
    };

    // Prepare translation data for reporting
    const exportTranslations = {
        sheet_name: tExport('sheet_name'),
        date: tExport('date'),
        title: tExport('title'),
        url: tExport('url'),
        type: tExport('type'),
        source: tExport('source'),
        publisher_username: tExport('publisher_username'),
        depth: tExport('depth'),
        country: tExport('country'),
        sentiment: tExport('sentiment'),
        relevancy: tExport('relevancy'),
        reach: tExport('reach'),
        likes: tExport('likes'),
        retweets: tExport('retweets'),
        replies: tExport('replies'),
        status: tExport('status'),
        ave: tExport('ave'),
        hashtags: tExport('hashtags'),
        brand_name: settings?.brandName || tExport('brand_name'),
        brand_tagline: settings?.brandTagline || tExport('brand_tagline'),
        footer_url: settings?.footerUrl || tExport('footer_url'),
        logo_url: settings?.logoUrl || undefined,
        generated_at: tExport('generated_at', { date: '{date}' }),
        page_count: tExport('page_count', { current: '{current}', total: '{total}' }),
        report_title: tExport('report_title'),
        total_articles: tExport('total_articles'),
        keyword_label: tExport('keyword_label'),
        region_label: tExport('region_label'),
        langs_label: tExport('langs_label'),
        summary_title: tExport('summary_title'),
        total_reach: tExport('total_reach'),
        ad_value: tExport('ad_value'),
        sentiment_title: tExport('sentiment_title'),
        sentiment_pos: tExport('sentiment_pos'),
        sentiment_neu: tExport('sentiment_neu'),
        sentiment_neg: tExport('sentiment_neg'),
        ai_recommendation: tExport('ai_recommendation'),
        rec_high_neg: tExport('rec_high_neg'),
        rec_mod_neg: tExport('rec_mod_neg'),
        rec_healthy: tExport('rec_healthy'),
        coverage_log: tExport('coverage_log')
    };

    const handleDownload = async () => {
        if (!collection || !collection.items || collection.items.length === 0) {
            toast.error(tLibrary('empty_collection'));
            return;
        }

        const monitoringItems = collection.items
            .filter((i: any) => i.type === "media_monitoring")
            .map((i: any) => i.data);

        if (monitoringItems.length === 0) {
            toast.error(tLibrary('no_exportable_items'));
            return;
        }

        try {
            toast.loading(tCommon('downloading'), { id: 'download-collection' });
            await ReportGenerator.exportMediaMonitoringReport(
                monitoringItems,
                exportTranslations as any,
                'pdf',
                settings?.logoUrl || undefined
            );
            toast.success(tCommon('success'), { id: 'download-collection' });
        } catch (error) {
            console.error('Download failed', error);
            toast.error(tCommon('error'), { id: 'download-collection' });
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div 
                role="dialog"
                aria-modal="true"
                className="bg-card w-full max-w-2xl rounded-[2rem] border border-border overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30 shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-foreground truncate">
                            {collection?.name || tCommon("loading")}
                        </h3>
                        {collection?.description && (
                            <p className="text-sm text-foreground/60 mt-1 truncate">
                                {collection.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={tCommon('cancel')}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/60 hover:text-foreground"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Sub-Header Actions */}
                {collection && (
                    <div className="p-4 border-b border-border bg-muted/10 shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder={tCommon("search_placeholder") || "Search items..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl py-1.5 ps-10 pe-4 text-xs text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {/* General Actions */}
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                leftIcon={<Download className="w-3.5 h-3.5" />}
                                onClick={handleDownload}
                                disabled={items.length === 0}
                                className="text-xs py-1.5 h-auto bg-background"
                            >
                                {tCommon("download")}
                            </Button>
                            
                            {confirmDelete ? (
                                <div className="flex gap-1 animate-in fade-in">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setConfirmDelete(false)}
                                        disabled={isDeletingCollection}
                                        className="text-xs py-1.5 h-auto border-border text-foreground hover:bg-muted"
                                    >
                                        {tCommon("cancel")}
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={handleDeleteCollection}
                                        disabled={isDeletingCollection}
                                        leftIcon={isDeletingCollection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        className="text-xs py-1.5 h-auto bg-rose-600 hover:bg-rose-500 text-white border-0"
                                    >
                                        {tCommon("confirm") || "Confirm"}
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                                    onClick={() => setConfirmDelete(true)}
                                    className="text-xs py-1.5 h-auto border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500"
                                >
                                    {tCommon("delete") || "Delete"}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {collection === undefined ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-foreground/60">{tCommon("loading")}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-16 text-center space-y-4 border-2 border-dashed border-border rounded-2xl bg-muted/10">
                            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" aria-hidden="true" />
                            <p className="text-foreground/80 font-medium">{tLibrary("empty_collection")}</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto" aria-hidden="true" />
                            <p className="text-foreground/80 font-medium">{tCommon("no_results")}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredItems.map((item) => {
                                const source = item.data?.source || "Media";
                                const sentiment = item.data?.sentiment || "Neutral";
                                const publishedDate = item.data?.publishedDate || new Date(item.addedAt || Date.now()).toLocaleDateString();
                                const url = item.data?.url || item.data?.link;

                                return (
                                    <div 
                                        key={item.id}
                                        className="p-4 rounded-2xl bg-muted/20 border border-border/80 flex items-start justify-between gap-4 hover:border-primary/20 hover:bg-muted/40 transition-all group"
                                    >
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <h4 className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {item.title}
                                            </h4>
                                            
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-foreground/60 font-semibold">
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold border border-primary/20 shrink-0">
                                                    {item.type.replace("_", " ")}
                                                </span>
                                                <span className="shrink-0">{source}</span>
                                                <span className="shrink-0">•</span>
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <Calendar className="w-3 h-3" />
                                                    {publishedDate}
                                                </span>
                                                <span className="shrink-0">•</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                                                    sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    sentiment === "Negative" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                }`}>
                                                    {sentiment}
                                                </span>
                                            </div>

                                            {item.data?.content && (
                                                <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">
                                                    {item.data.content}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                                            {url && (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg bg-background border border-border hover:bg-primary/10 hover:border-primary/30 text-foreground/60 hover:text-primary transition-all shrink-0"
                                                    title={tCommon("view_details")}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={removingItemId === item.id}
                                                className="p-1.5 h-auto rounded-lg border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500 shrink-0 shadow-none bg-background"
                                                title={tCommon("delete") || "Remove item"}
                                            >
                                                {removingItemId === item.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
