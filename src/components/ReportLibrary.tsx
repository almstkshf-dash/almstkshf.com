"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FileText, Download, Calendar, Search, Filter } from "lucide-react";
import Button from "./ui/Button";
import { SkeletonReportRow } from "./ui/Skeleton";
import React, { useState, useEffect } from "react";
import clsx from "clsx";

import { useTranslations } from "next-intl";

export default function ReportLibrary() {
    const t = useTranslations("MediaMonitoring.central_media_repository.library");
    const tCommon = useTranslations("Common");
    const collectionsResult = useQuery(api.collections.getCollections) || [];
    const [inputValue, setInputValue] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(inputValue);
        }, 150);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const filteredCollections = collectionsResult?.filter((c: any) =>
        c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/50 p-4 rounded-2xl border border-border">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <label htmlFor="report-search" className="sr-only">{t('search_label')}</label>
                    <input
                        id="report-search"
                        name="q"
                        type="text"
                        placeholder={t('search_placeholder')}
                        className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary transition-colors"
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
                        <p className="text-muted-foreground font-medium">{t('no_results')}</p>
                    </div>
                ) : (
                    filteredCollections?.map((collection: any) => (
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
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" aria-hidden="true" />
                                            {new Date(collection.updatedAt).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span className="text-muted-foreground">{collection.items?.length || 0} Items</span>
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
