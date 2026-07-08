/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { Activity, ShieldAlert, ShieldCheck, Zap, BarChart3, AlertCircle, FileSpreadsheet, FileText, Clock } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useMemo, memo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import Skeleton, { ChartSkeleton } from "@/components/ui/Skeleton";

// Lazy-load charts to keep Recharts out of the critical bundle
const SentimentDonutChart = dynamic(() => import("./SentimentDonutChart"), {
    ssr: false,
    loading: () => <ChartSkeleton className="w-full aspect-[4/3]" />
});
const EmotionRadarChart = dynamic(() => import("./EmotionRadarChart"), {
    ssr: false,
    loading: () => <ChartSkeleton className="w-full aspect-[4/3]" />
});
const ArticlesTrendChart = dynamic(() => import("./ArticlesTrendChart"), {
    ssr: false,
    loading: () => <ChartSkeleton className="w-full aspect-[2/1] md:aspect-[3/1]" />
});

import Button from "@/components/ui/Button";
import html2canvas from "html2canvas-pro";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MonitoringArticle } from "@/types/reports";
import { useReportExport } from "@/hooks/useReportExport";
import { parsePublishedDate } from "@/utils/date-utils";

interface DashboardGridProps {
    articles?: MonitoringArticle[];
    analytics?: {
        nss: number;
        riskScore: number;
        velocity: number;
        totalReach: number;
        sentimentDistribution: Record<string, number>;
        crisisProbability: number;
        emotions?: Record<string, number>;
        geography?: Record<string, number>;
        riskFactors?: string[];
    };
    isLoading?: boolean;
    aiSummary?: string;
    isAiLoading?: boolean;
    topLeftSlot?: React.ReactNode;
    topRightSlot?: React.ReactNode;
}

const DashboardGrid = memo(({ articles, analytics, isLoading, aiSummary, isAiLoading, topLeftSlot, topRightSlot }: DashboardGridProps) => {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const [trendRange, setTrendRange] = useState<7 | 30>(7);
    const saveReport = useMutation(api.userActions.saveReport);

    const { isExporting, exportPressRelease } = useReportExport();

    // Chart container refs for screenshot capture instead of DOM ID lookups
    const sentimentDonutRef = useRef<HTMLDivElement>(null);
    const emotionRadarRef = useRef<HTMLDivElement>(null);
    const articlesTrendRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(async (format: 'pdf' | 'csv' | 'excel') => {
        if (!articles || articles.length === 0) return;

        try {
            let chartImages: { sentimentDonut?: string; emotionRadar?: string; articlesTrend?: string } = {};

            if (format === 'pdf') {
                const capture = async (el: HTMLDivElement | null) => {
                    if (!el) return undefined;
                    try {
                        const canvas = await html2canvas(el, {
                            scale: 2,
                            useCORS: true,
                            backgroundColor: null
                        });
                        return canvas.toDataURL('image/png');
                    } catch (e) {
                        console.warn(`Could not capture chart:`, e);
                        return undefined;
                    }
                };

                // Parallel/concurrent chart capture
                const [donutImg, radarImg, trendImg] = await Promise.all([
                    capture(sentimentDonutRef.current),
                    capture(emotionRadarRef.current),
                    capture(articlesTrendRef.current)
                ]);

                chartImages = {
                    sentimentDonut: donutImg,
                    emotionRadar: radarImg,
                    articlesTrend: trendImg
                };
            }

            await exportPressRelease(articles, format, chartImages);

            // Save trace to backend
            await saveReport({
                type: format,
                articleCount: articles.length,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Report download failed:", error);
        }
    }, [articles, exportPressRelease, saveReport]);

    const stats = useMemo(() => [
        {
            label: t("nss_index"),
            value: `${analytics?.nss || 0}%`,
            icon: Activity,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            description: t("nss_desc")
        },
        {
            label: t("risk_level"),
            value: analytics?.riskScore || 0,
            icon: ShieldAlert,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            description: t("risk_desc")
        },
        {
            label: t("velocity"),
            value: `${analytics?.velocity || 0} p/h`,
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            description: t("velocity_desc")
        },
        {
            label: t("total_reach"),
            value: analytics?.totalReach?.toLocaleString() || 0,
            icon: BarChart3,
            color: "text-emerald-700 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
            description: t("reach_desc")
        }
    ], [analytics, t]);

    const riskFactorItems = useMemo(() => analytics?.riskFactors?.map(f => {
        const translationKey = `factors.${f.toLowerCase()}`;
        const translated = (t as any)(translationKey);
        return translated === translationKey ? f : translated;
    }) || [], [analytics, t]);

    const sentimentData = useMemo(() => ({
        positive: analytics?.sentimentDistribution?.positive || 0,
        neutral: analytics?.sentimentDistribution?.neutral || 0,
        negative: analytics?.sentimentDistribution?.negative || 0
    }), [analytics]);

    const emotionData = useMemo(() => [
        { subject: 'Joy', value: analytics?.emotions?.joy || 0, fullMark: 100 },
        { subject: 'Anger', value: analytics?.emotions?.anger || 0, fullMark: 100 },
        { subject: 'Fear', value: analytics?.emotions?.fear || 0, fullMark: 100 },
        { subject: 'Sadness', value: analytics?.emotions?.sadness || 0, fullMark: 100 },
        { subject: 'Surprise', value: analytics?.emotions?.surprise || 0, fullMark: 100 },
    ], [analytics]);

    const parseArticleDate = useCallback((article: MonitoringArticle): Date | null => {
        if (article._creationTime) {
            const date = new Date(article._creationTime);
            return Number.isNaN(date.getTime()) ? null : date;
        }
        return parsePublishedDate(article.publishedDate);
    }, []);

    // Optimized linear-time trend computation O(N + X) instead of quadratic O(N * X)
    const trendData = useMemo(() => {
        if (!articles) return [];

        // 1. Group by date in linear time O(N)
        const dateCounts: Record<string, number> = {};
        for (const a of articles) {
            const date = parseArticleDate(a);
            if (date) {
                const dateStr = date.toISOString().split('T')[0];
                dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
            }
        }

        // 2. Generate the last X days list O(X)
        const lastXDays = Array.from({ length: trendRange }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        // 3. Map to trend objects in O(1) per day
        return lastXDays.map(dateStr => ({
            date: dateStr.split('-').slice(1).join('/'),
            count: dateCounts[dateStr] || 0
        }));
    }, [articles, trendRange, parseArticleDate]);

    return (
        <div className="space-y-6">
            {/* Header with Slot & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {topLeftSlot || <div className="h-8 w-32 bg-muted/20 animate-pulse rounded-lg" />}
                </div>
                <div className="flex items-center gap-2">
                    {topRightSlot || <div className="h-8 w-24 bg-muted/20 animate-pulse rounded-lg" />}
                    <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload('pdf')}
                            disabled={!!isExporting}
                            className="text-xs h-8 px-3 text-foreground bg-muted/10 hover:bg-muted/20 border border-border"
                        >
                            <FileText className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                            PDF
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload('csv')}
                            disabled={!!isExporting}
                            className="text-xs h-8 px-3 text-foreground bg-muted/10 hover:bg-muted/20 border border-border"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                            CSV
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-card border border-border/50 rounded-2xl relative overflow-hidden group hover:shadow-lg hover:shadow-black/5 transition-all"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className={clsx("p-2 rounded-xl", stat.bg)}>
                                    <stat.icon className={clsx("w-5 h-5", stat.color)} />
                                </div>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-16" />
                                ) : (
                                    <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                                )}
                            </div>
                            {isLoading ? (
                                <div className="space-y-2 mt-2">
                                    <Skeleton className="h-3.5 w-20" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-[10px] text-foreground/40 mt-1">{stat.description}</p>
                                </>
                            )}
                        </div>
                        {/* Subtle background glow */}
                        <div className={clsx("absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full", stat.bg)} />
                    </motion.div>
                ))}
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Sentiment & Emotions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Sentiment Donut */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 relative group overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">{t("sentiment_distribution")}</h3>
                            {typeof (analytics as any)?.sentimentChange === 'number' && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    {(analytics as any).sentimentChange >= 0 ? '+' : ''}{(analytics as any).sentimentChange.toFixed(1)}%
                                </div>
                            )}
                        </div>
                        {isLoading ? (
                            <ChartSkeleton className="w-full aspect-[4/3]" />
                        ) : (
                            <div ref={sentimentDonutRef} className="w-full aspect-[4/3]">
                                <SentimentDonutChart data={sentimentData} nssIndex={analytics?.nss || 0} />
                            </div>
                        )}

                        {/* Legend */}
                        {isLoading ? (
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/40 animate-pulse">
                                <div className="text-center">
                                    <Skeleton className="h-4 w-8 mx-auto" />
                                    <Skeleton className="h-3 w-12 mx-auto mt-1" />
                                </div>
                                <div className="text-center border-x border-border/40">
                                    <Skeleton className="h-4 w-8 mx-auto" />
                                    <Skeleton className="h-3 w-12 mx-auto mt-1" />
                                </div>
                                <div className="text-center">
                                    <Skeleton className="h-4 w-8 mx-auto" />
                                    <Skeleton className="h-3 w-12 mx-auto mt-1" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/40">
                                <div className="text-center">
                                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{sentimentData.positive}%</div>
                                    <div className="text-[10px] text-foreground/70 uppercase">{t("ToneLabels.positive")}</div>
                                </div>
                                <div className="text-center border-x border-border/40">
                                    <div className="text-xs font-bold text-amber-500">{sentimentData.neutral}%</div>
                                    <div className="text-[10px] text-foreground/70 uppercase">{t("ToneLabels.neutral")}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-rose-500">{sentimentData.negative}%</div>
                                    <div className="text-[10px] text-foreground/70 uppercase">{t("ToneLabels.negative")}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Emotions Radar */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 relative overflow-hidden">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-6">{t("emotional_integrity")}</h3>
                        {isLoading ? (
                            <ChartSkeleton className="w-full aspect-[4/3]" />
                        ) : (
                            <div className="w-full aspect-[4/3]">
                                <EmotionRadarChart ref={emotionRadarRef} data={emotionData} />
                            </div>
                        )}
                    </div>

                    {/* Geographic Activity */}
                    {((analytics?.geography && Object.keys(analytics.geography).length > 0) || isLoading) && (
                        <div className="bg-card border border-border/50 rounded-3xl p-6 relative overflow-hidden">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-6">{t("geographic_reach", { defaultValue: "Geographic Reach" })}</h3>
                            {isLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-2 flex-1 mx-4" />
                                            <Skeleton className="h-4 w-8" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(analytics?.geography || {})
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([country, count]) => (
                                            <div key={country} className="flex items-center justify-between">
                                                <span className="text-xs font-bold w-20 truncate">{country}</span>
                                                <div className="flex-1 mx-4 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500"
                                                        style={{ width: `${Math.min(100, (count / (articles?.length || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-foreground/60">{count}</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Trends & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Trend Line */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">{t("article_volume_trend")}</h3>
                                <p className="text-[10px] text-foreground/60 mt-0.5">{t("trend_subtitle")}</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
                                <button
                                    type="button"
                                    aria-pressed={trendRange === 7}
                                    onClick={() => setTrendRange(7)}
                                    className={clsx("px-3 py-1 rounded shadow-sm text-[10px] font-bold border transition-colors", trendRange === 7 ? "bg-card border-border/40 text-foreground" : "border-transparent opacity-50 hover:opacity-100")}
                                >
                                    7D
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={trendRange === 30}
                                    onClick={() => setTrendRange(30)}
                                    className={clsx("px-3 py-1 rounded shadow-sm text-[10px] font-bold border transition-colors", trendRange === 30 ? "bg-card border-border/40 text-foreground" : "border-transparent opacity-50 hover:opacity-100")}
                                >
                                    30D
                                </button>
                            </div>
                        </div>
                        {isLoading ? (
                            <ChartSkeleton className="w-full aspect-[2/1] md:aspect-[3/1]" />
                        ) : (
                            <div ref={articlesTrendRef} className="w-full aspect-[2/1] md:aspect-[3/1]">
                                <ArticlesTrendChart data={trendData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Risk Factors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Breakdown */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden lg:col-span-3">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-rose-500/80">{t("critical_risk_factors")}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {isLoading ? (
                            [1, 2].map((i) => (
                                <div key={i} className="h-12 bg-white/50 dark:bg-black/20 rounded-xl border border-rose-500/10 flex items-center px-3 animate-pulse">
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))
                        ) : riskFactorItems.length > 0 ? (
                            riskFactorItems.map((factor, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-rose-500/10">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                    <span className="text-xs font-bold">{factor}</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-4 text-center text-xs text-foreground/40 font-bold uppercase tracking-widest">
                                {t("no_risks_detected")}
                            </div>
                        )}
                    </div>

                    {/* Probability Meter */}
                    <div className="mt-8 pt-6 border-t border-rose-500/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t("crisis_probability")}</span>
                            {isLoading ? (
                                <Skeleton className="h-4 w-8" />
                            ) : (
                                <span className="text-xs font-black text-rose-500">{analytics?.crisisProbability || 0}%</span>
                            )}
                        </div>
                        <div className="w-full h-2 bg-rose-500/10 rounded-full overflow-hidden">
                            {isLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${analytics?.crisisProbability || 0}%` }}
                                    className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

DashboardGrid.displayName = "DashboardGrid";

export default DashboardGrid;
