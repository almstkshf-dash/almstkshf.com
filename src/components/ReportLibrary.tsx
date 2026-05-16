/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileText, Download, Calendar, Search, Filter } from "lucide-react";
import Button from "./ui/Button";
import { SkeletonReportRow } from "./ui/Skeleton";
import React, { useState, useEffect } from "react";
import clsx from "clsx";

import { useTranslations } from "next-intl";
import { ReportGenerator } from "@/lib/report-generator";
import { toast } from "sonner";

export default function ReportLibrary() {
    const t = useTranslations("MediaMonitoring.central_media_repository.library");
    const tCommon = useTranslations("Common");
    const collectionsResult = useQuery(api.collections.getCollections) ?? [];
    const [inputValue, setInputValue] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(inputValue);
        }, 150);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const filteredCollections = collectionsResult?.filter((c: { _id: string; name: string; items?: any[]; [key: string]: any }) =>
        c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const tExport = useTranslations("MediaMonitoring.dashboard.export_translations");

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
        relevancy: tExport('relevancy'),
        reach: tExport('reach'),
        likes: tExport('likes'),
        retweets: tExport('retweets'),
        replies: tExport('replies'),
        status: tExport('status'),
        ave: tExport('ave'),
        hashtags: tExport('hashtags'),
        brand_name: tExport('brand_name'),
        brand_tagline: tExport('brand_tagline'),
        footer_url: tExport('footer_url'),
        generated_at: tExport('generated_at'),
        page_count: tExport('page_count'),
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

    const handleDownload = async (collection: any) => {
        if (!collection.items || collection.items.length === 0) {
            toast.error(t('empty_collection'));
            return;
        }

        const monitoringItems = collection.items
            .filter((i: any) => i.type === "media_monitoring")
            .map((i: any) => i.data);

        if (monitoringItems.length === 0) {
            toast.error(t('no_exportable_items'));
            return;
        }

        try {
            toast.loading(tCommon('downloading'), { id: 'download-report' });
            await ReportGenerator.exportMediaMonitoringReport(
                monitoringItems,
                exportTranslations as any,
                'pdf'
            );
            toast.success(tCommon('success'), { id: 'download-report' });
        } catch (error) {
            console.error('Download failed', error);
            toast.error(tCommon('error'), { id: 'download-report' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/50 p-4 rounded-2xl border border-border">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" aria-hidden="true" />
                    <label htmlFor="report-search" className="sr-only">{t('search_label')}</label>
                    <input
                        id="report-search"
                        name="q"
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" aria-hidden="true" />}>
                        {t('filter')}
                    </Button>
                    <Button variant="outline" size="sm">
                        {t('recent_first')}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {!collectionsResult ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonReportRow key={i} />
                    ))
                ) : filteredCollections?.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" aria-hidden="true" />
                        <p className="text-foreground/80 font-medium">{t('no_results')}</p>
                    </div>
                ) : (
                    filteredCollections?.map((collection: { _id: string; name: string; items?: unknown[]; [key: string]: unknown }) => (
                        <div
                            key={collection._id}
                            className="bg-card/40 border border-border hover:border-border/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-card/60 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-foreground font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                        {collection.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-foreground/70 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" aria-hidden="true" />
                                            {new Date(collection.updatedAt as number).toLocaleDateString()}
                                        </span>
                                        <span>â€¢</span>
                                        <span className="text-foreground/70">{collection.items?.length || 0} Items</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-border hover:bg-muted"
                                >
                                    {tCommon('view_details')}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Download className="w-3 h-3" aria-hidden="true" />}
                                    className="bg-blue-600 hover:bg-blue-500"
                                    onClick={() => handleDownload(collection)}
                                >
                                    {tCommon('download')}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
