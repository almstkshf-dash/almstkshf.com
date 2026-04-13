"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
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

interface DashboardArticle {
    _id: string;
    title: string;
    sentiment: "Positive" | "Neutral" | "Negative";
    sourceType: string;
    publishedDate: string;
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
            {reports && reports.length > 0 && <ReportsChart data={reports.map((a: any) => ({
                reportName: a.title || a.reportName,
                source: a.sourceType || a.source,
                timestamp: a.publishedDate || a.createdAt || a.timestamp,
                sentiment: a.sentiment
            }))} />}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <Button
                        key={f.label}
                        variant={filter === f.value ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => {
                            if (filter === f.value && f.value !== "All") {
                                router.push(f.href);
                            } else {
                                handleFilterChange(f.value);
                            }
                        }}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 h-auto shadow-none",
                            filter === f.value
                            && "shadow-lg shadow-primary/25"
                        )}
                        leftIcon={<f.icon className="w-4 h-4" />}
                    >
                        <span className="capitalize">{f.label}</span>
                    </Button>
                ))}
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports === undefined ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 bg-card border border-border rounded-xl transition-colors duration-300">
                            <SkeletonReportRow />
                        </div>
                    ))
                ) : reports.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-muted/30 border border-border border-dashed rounded-3xl transition-colors duration-300">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-foreground/70 font-medium">{tMedia('no_reports')}</p>
                        <Link
                            href="/media-monitoring/central-media-repository" className="text-primary text-sm hover:underline mt-2 inline-block transition-colors"
                        >
                            {tMedia('visit_repository')}
                        </Link>
                    </div>
                ) : (
                    reports.map((report: any) => (
                        <div key={report._id} className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-muted rounded-lg text-primary group-hover:text-primary/80 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className={clsx(
                                    "px-2 py-0.5 text-xs rounded-full border transition-colors",
                                    report.status === "Published"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                )}>
                                    {report.status}
                                </span>
                            </div>
                            <h3 className="font-medium text-foreground mb-1 transition-colors">{report.reportName || report.title}</h3>
                            <div className="text-xs text-foreground/70 mb-4 flex gap-2 transition-colors">
                                <span>{report.source || report.sourceType}</span>
                                <span>•</span>
                                <span>{new Date(report.timestamp || report.publishedDate || report.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    leftIcon={<Download className="w-3 h-3" />}
                                    onClick={() => report.url && window.open(report.url, '_blank')}
                                >
                                    {tCommon('view_details')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    onClick={() => setItemToSave(report)}
                                >
                                    <FolderPlus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
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
