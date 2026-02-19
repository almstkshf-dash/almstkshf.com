"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Filter, Mic2, Radio, Newspaper, FileText, Download } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";
import CrisisPlanCard from "./CrisisPlanCard";
import { SkeletonReportRow, SkeletonCard } from "./ui/Skeleton";
import ReportsChart from "./ReportsChart";

interface DashboardProps {
    defaultFilter?: "TV" | "Radio" | "Press";
}

export default function MediaMonitoringDashboard({ defaultFilter }: DashboardProps) {
    const t = useTranslations("Navigation");
    const tMedia = useTranslations("MediaMonitoring.dashboard");
    const tCommon = useTranslations("Common");
    const [filter, setFilter] = useState<"TV" | "Radio" | "Press" | undefined>(defaultFilter);

    const articles = useQuery(api.monitoring.getArticles, {
        limit: 10,
        sourceType: filter === "all" ? undefined : filter
    });
    const crisisPlans = useQuery(api.queries.getCrisisPlans, {});

    const router = useRouter();
    const locale = useLocale();

    const filters: { label: string; value: "TV" | "Radio" | "Press" | undefined; icon: any; href: string }[] = [
        { label: "all", value: undefined, icon: Filter, href: "/media-monitoring/central-media-repository" },
        { label: "tv", value: "TV", icon: Mic2, href: "/media-monitoring/tv-radio" },
        { label: "radio", value: "Radio", icon: Radio, href: "/media-monitoring/tv-radio" },
        { label: "press", value: "Press", icon: Newspaper, href: "/media-monitoring/press" },
    ];

    return (
        <div className="space-y-8">
            {/* Chart Section */}
            {articles && articles.length > 0 && <ReportsChart data={articles.map(a => ({
                reportName: a.title,
                source: a.sourceType,
                timestamp: a.createdAt,
                sentiment: a.sentiment
            }))} />}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.label}
                        onClick={() => {
                            if (filter === f.value) {
                                // If already selected and user clicks again, maybe navigate to the full page?
                                router.push(f.href);
                            } else {
                                setFilter(f.value);
                            }
                        }}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                            filter === f.value
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <f.icon className="w-4 h-4" />
                        <span className="capitalize">{t(f.label)}</span>
                    </button>
                ))}
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles === undefined ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 bg-card border border-border rounded-xl transition-colors duration-300">
                            <SkeletonReportRow />
                        </div>
                    ))
                ) : articles.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-muted/30 border border-border border-dashed rounded-3xl transition-colors duration-300">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">{tMedia('no_reports')}</p>
                        <Link
                            href={`/${locale}/media-monitoring/central-media-repository`}
                            className="text-primary text-sm hover:underline mt-2 inline-block transition-colors"
                        >
                            {tMedia('visit_repository')}
                        </Link>
                    </div>
                ) : (
                    articles.map((article: any) => (
                        <div key={article._id} className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-muted rounded-lg text-primary group-hover:text-primary/80 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className={clsx(
                                    "px-2 py-0.5 text-xs rounded-full border transition-colors",
                                    article.sentiment === "Positive"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : article.sentiment === "Negative"
                                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                )}>
                                    {article.sentiment}
                                </span>
                            </div>
                            <h3 className="font-medium text-foreground mb-1 transition-colors line-clamp-1">{article.title}</h3>
                            <div className="text-xs text-muted-foreground mb-4 flex gap-2 transition-colors">
                                <span>{article.sourceType}</span>
                                <span>•</span>
                                <span>{article.publishedDate}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                leftIcon={<Download className="w-3 h-3" />}
                                onClick={() => window.open(article.url, '_blank')}
                            >
                                {tCommon('view_source')}
                            </Button>
                        </div>
                    ))
                )}
            </div>

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
