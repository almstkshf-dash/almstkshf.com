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
import { Filter, Globe, Newspaper, FileText, Download, type LucideIcon } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import CrisisPlanCard from "./CrisisPlanCard";
import { SkeletonReportRow, SkeletonCard } from "./ui/Skeleton";
import ReportsChart from "./ReportsChart";
import SaveToCollectionModal from "./ui/SaveToCollectionModal";
import { FolderPlus } from "lucide-react";

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

    React.useEffect(() => {
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

    // Memoize the chart data mapping to avoid inline array creation on every render
    const chartData = useMemo(() => {
        if (!reports || (Array.isArray(reports) && reports.length === 0)) return null;
        return (reports as any[])?.map((a: any) => ({
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

            {/* Crisis Management Section */}
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2 transition-colors duration-300">
                    <span className="w-1 h-8 bg-rose-500 rounded-full block"></span>
                    {t('crisis_management')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {crisisPlans === undefined ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))
                    ) : (
                        crisisPlans.map((plan: any, i: number) => (
                            <CrisisPlanCard key={i} {...plan} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
