/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Filter, Globe, Newspaper, FileText, Download, type LucideIcon, FolderPlus, ExternalLink } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import CrisisPlanCard from "./CrisisPlanCard";
import { SkeletonReportRow, SkeletonCard } from "./ui/Skeleton";
import ReportsChart from "./ReportsChart";
import SaveToCollectionModal from "./ui/SaveToCollectionModal";

type LegacyFilter = "TV" | "Radio" | "Press";
type ArticleFilter = "All" | "Online News" | "Social Media" | "Press Release" | "Blog" | "Print";

type DashboardFilter = LegacyFilter | ArticleFilter;

interface DashboardProps {
    defaultFilter?: DashboardFilter;
}

interface FilterOption {
    label: string;
    value: ArticleFilter;
    icon: LucideIcon;
    href: string;
}

function normalizeFilter(filter?: DashboardFilter): ArticleFilter {
    if (!filter) return "All";

    if (filter === "Press") return "Press Release";
    if (filter === "TV" || filter === "Radio") return "All";

    return filter;
}

export default function MediaMonitoringDashboard({ defaultFilter }: DashboardProps) {
    const t = useTranslations("Navigation");
    const tMedia = useTranslations("MediaMonitoring.dashboard");
    const tCommon = useTranslations("Common");

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Initialize filter from URL search parameters, falling back to normalized defaultFilter
    const [filter, setFilter] = useState<ArticleFilter>(
        (searchParams.get('mfilter') as ArticleFilter) || normalizeFilter(defaultFilter)
    );
    const [itemToSave, setItemToSave] = useState<any>(null);

    // Sync state with URL search parameters to handle back/forward navigation
    useEffect(() => {
        const f = searchParams.get('mfilter') as ArticleFilter;
        if (f && ["All", "Online News", "Social Media", "Press Release", "Blog", "Print"].includes(f)) {
            setFilter(f);
        }
    }, [searchParams]);

    const handleFilterChange = (newFilter: ArticleFilter) => {
        setFilter(newFilter);
        const params = new URLSearchParams(searchParams.toString());
        params.set('mfilter', newFilter);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const reports = useQuery(api.queries.getMediaReports, { source: filter });
    const crisisPlans = useQuery(api.queries.getCrisisPlans, {});

    const filters = useMemo<FilterOption[]>(() => [
        { label: "All", value: "All", icon: Filter, href: "/media-monitoring/central-media-repository" },
        { label: "Online News", value: "Online News", icon: Newspaper, href: "/media-monitoring/press" },
        { label: "Social Media", value: "Social Media", icon: Globe, href: "/media-monitoring/media-pulse" },
        { label: "Press Release", value: "Press Release", icon: FileText, href: "/media-monitoring/press" },
    ], []);

    const chartData = useMemo(() => {
        if (!reports || (Array.isArray(reports) && reports.length === 0)) return null;
        return (reports as any[])?.map((a) => ({
            reportName: a.title || a.reportName,
            source: a.sourceType || a.source,
            timestamp: a.publishedDate || a.createdAt || a.timestamp,
            sentiment: a.sentiment
        }));
    }, [reports]);

    if (!mounted) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-64 bg-muted/20 rounded-3xl border border-border" />
                <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-muted/30 rounded-full" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 bg-muted/20 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Chart Section */}
            {chartData && <ReportsChart data={chartData} />}

            {/* Filter Section */}
            <div className="flex flex-wrap gap-3 py-2">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleFilterChange(f.value)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                            "border shadow-sm",
                            filter === f.value
                                ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-2 ring-primary/20"
                                : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:border-muted-foreground/30 hover:text-foreground"
                        )}
                    >
                        <f.icon className={clsx("w-4 h-4", filter === f.value ? "animate-pulse" : "")} />
                        {f.label}
                    </button>
                ))}
            </div>

            {itemToSave && (
                <SaveToCollectionModal 
                    isOpen={!!itemToSave} 
                    onClose={() => setItemToSave(null)}
                    item={{
                        id: itemToSave._id,
                        type: "media_monitoring",
                        title: itemToSave.reportName || itemToSave.title,
                        data: itemToSave
                    }}
                />
            )}

            {/* Articles Grid */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 transition-colors duration-300">
                        <span className="w-1 h-8 bg-primary rounded-full block"></span>
                        {tMedia('coverage_log') || "Coverage Log"}
                    </h2>
                    {reports && reports.length > 0 && (
                        <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/50">
                            {reports.length} {tCommon('articles_count') || "Articles"}
                        </div>
                    )}
                </div>

                {reports === undefined ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border text-center px-4">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                            <Newspaper className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground font-medium">{tMedia('no_results') || "No articles match your criteria."}</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">{tMedia('no_results_hint') || "Try adjusting your filters or refining your search query."}</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-6"
                            onClick={() => handleFilterChange("All")}
                        >
                            {tMedia('reset_filters') || "Reset All Filters"}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((article: any) => (
                            <div 
                                key={article._id}
                                className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full"
                            >
                                <div className="p-5 flex-1 space-y-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                                {article.sourceType}
                                            </div>
                                            <div className={clsx(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                article.sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                article.sentiment === "Negative" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            )}>
                                                {article.sentiment}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setItemToSave(article)}
                                            className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                                            title={tCommon('save_to_collection')}
                                        >
                                            <FolderPlus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>{article.source}</span>
                                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                                            <span>{article.publishedDate}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed">
                                        {article.content}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">Reach</div>
                                            <div className="text-sm font-bold text-foreground">{(article.reach || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70">AVE ($)</div>
                                            <div className="text-sm font-bold text-primary">${(article.ave || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{article.status}</span>
                                    </div>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all group/link"
                                        title={t('view_source')}
                                    >
                                        <ExternalLink className="w-4 h-4 transition-transform group-hover/link:rotate-12 rtl:group-hover/link:-rotate-12" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Crisis Management Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 transition-colors duration-300">
                    <span className="w-1 h-8 bg-rose-500 rounded-full block"></span>
                    {t('crisis_management')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {crisisPlans === undefined ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))
                    ) : (
                        crisisPlans.map((plan: { _id: string; title: string; priority: "Low" | "Medium" | "High"; actions: string[]; status: string }, i: number) => (
                            <CrisisPlanCard key={plan._id || i} {...plan} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
