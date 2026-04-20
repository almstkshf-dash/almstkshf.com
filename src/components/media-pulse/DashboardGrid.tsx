/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { Activity, ShieldAlert, ShieldCheck, Zap, BarChart3, AlertCircle, Globe, Download, FileSpreadsheet, FileText, Clock } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import SentimentTracker from "@/components/SentimentTracker";
import { useTranslations } from "next-intl";
import { useMemo, memo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";
import { ChartSkeleton } from "@/components/ui/Skeleton";

// Lazy-load charts to keep Recharts out of the critical bundle
const SentimentDonutChart = dynamic(() => import("./SentimentDonutChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="300px" />
});
const EmotionRadarChart = dynamic(() => import("./EmotionRadarChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="200px" />
});
const ArticlesTrendChart = dynamic(() => import("./ArticlesTrendChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="160px" />
});
const VolumeHeatmapChart = dynamic(() => import("./VolumeHeatmapChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="400px" />
});

import { ReportGenerator } from "@/lib/report-generator";
import Button from "@/components/ui/Button";
import { useMessages } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface DashboardGridProps {
    articles?: any[];
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
    topLeftSlot?: React.ReactNode;
    topRightSlot?: React.ReactNode;
}

const DashboardGrid = memo(({ articles, analytics, topLeftSlot, topRightSlot }: DashboardGridProps) => {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const localeTranslations = useMessages();
    const [isGenerating, setIsGenerating] = useState(false);
    const saveReport = useMutation(api.userActions.saveReport);

    const handleDownload = useCallback(async (format: 'pdf' | 'csv' | 'excel') => {
        if (!articles || articles.length === 0) return;

        setIsGenerating(true);
        try {
            const generator = new ReportGenerator(articles, localeTranslations);
            let blob;
            let filename = `media-monitoring-report-${new Date().toISOString().split('T')[0]}`;

            if (format === 'pdf') {
                blob = await generator.generatePDF();
                filename += '.pdf';
            } else if (format === 'csv') {
                blob = generator.generateCSV();
                filename += '.csv';
            } else {
                blob = await generator.generateExcel();
                filename += '.xlsx';
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Save trace to backend
            await saveReport({
                type: format,
                articleCount: articles.length,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error("Report generation failed", error);
        } finally {
            setIsGenerating(false);
        }
    }, [articles, localeTranslations, saveReport]);

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

    const riskFactorItems = useMemo(() => analytics?.riskFactors?.map(f => t(`factors.${f.toLowerCase()}`, { defaultValue: f })) || [], [analytics, t]);

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

    const trendData = useMemo(() => {
        if (!articles) return [];
        // Group by date for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => ({
            date: date.split('-').slice(1).join('/'),
            count: articles.filter(a => a._creationTime && new Date(a._creationTime).toISOString().startsWith(date)).length
        }));
    }, [articles]);

    const heatmapData = useMemo(() => {
        // Mock heatmap data for now based on articles or random for visualization
        const mockData = [];
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                mockData.push({ day: d, hour: h, value: Math.floor(Math.random() * 50) });
            }
        }
        return mockData;
    }, []);

    return (
        <div className="space-y-6">
            {/* Header with Slot & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {topLeftSlot}
                </div>
                <div className="flex items-center gap-2">
                    {topRightSlot}
                    <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload('pdf')}
                            disabled={isGenerating}
                            className="text-xs h-8 px-3"
                        >
                            <FileText className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                            PDF
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload('csv')}
                            disabled={isGenerating}
                            className="text-xs h-8 px-3"
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
                                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                            </div>
                            <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-[10px] text-foreground/40 mt-1">{stat.description}</p>
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
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t("sentiment_distribution")}</h3>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                +2.4%
                            </div>
                        </div>
                        <SentimentDonutChart data={sentimentData} nssIndex={analytics?.nss || 0} />

                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/40">
                            <div className="text-center">
                                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{sentimentData.positive}%</div>
                                <div className="text-[10px] text-foreground/50 uppercase">{t("ToneLabels.positive")}</div>
                            </div>
                            <div className="text-center border-x border-border/40">
                                <div className="text-xs font-bold text-amber-500">{sentimentData.neutral}%</div>
                                <div className="text-[10px] text-foreground/50 uppercase">{t("ToneLabels.neutral")}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-rose-500">{sentimentData.negative}%</div>
                                <div className="text-[10px] text-foreground/50 uppercase">{t("ToneLabels.negative")}</div>
                            </div>
                        </div>
                    </div>

                    {/* Emotions Radar */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 relative overflow-hidden">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-6">{t("emotional_integrity")}</h3>
                        <EmotionRadarChart data={emotionData} />
                    </div>
                </div>

                {/* Right Column: Trends & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Trend Line */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t("article_volume_trend")}</h3>
                                <p className="text-[10px] text-foreground/40 mt-0.5">{t("trend_subtitle")}</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
                                <div className="px-3 py-1 rounded bg-card shadow-sm text-[10px] font-bold border border-border/40">7D</div>
                                <div className="px-3 py-1 text-[10px] font-bold opacity-50 cursor-not-allowed">30D</div>
                            </div>
                        </div>
                        <div className="h-[200px]">
                            <ArticlesTrendChart data={trendData} />
                        </div>
                    </div>

                    {/* Activity Heatmap */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t("geographic_activity_heat")}</h3>
                                <p className="text-[10px] text-foreground/40 mt-0.5">{t("activity_heatmap_desc")}</p>
                            </div>
                            <Globe className="w-4 h-4 text-foreground/20" />
                        </div>
                        <div className="h-[280px]">
                            <VolumeHeatmapChart data={heatmapData} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Risk Factors & AI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Breakdown */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-rose-500/80">{t("critical_risk_factors")}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {riskFactorItems.length > 0 ? riskFactorItems.map((factor, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-rose-500/10">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-xs font-bold">{factor}</span>
                            </div>
                        )) : (
                            <div className="col-span-2 py-4 text-center text-xs text-foreground/40 font-bold uppercase tracking-widest">
                                {t("no_risks_detected")}
                            </div>
                        )}
                    </div>

                    {/* Probability Meter */}
                    <div className="mt-8 pt-6 border-t border-rose-500/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t("crisis_probability")}</span>
                            <span className="text-xs font-black text-rose-500">{analytics?.crisisProbability || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-rose-500/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${analytics?.crisisProbability || 0}%` }}
                                className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                            />
                        </div>
                    </div>
                </div>

                {/* AI Inspector Placeholder */}
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">{t("gemini_osint_pulse")}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                                    <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                                    {t("live_analysis")}
                                </div>
                            </div>
                        </div>
                        <Clock className="w-4 h-4 text-primary/30" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-sm leading-relaxed italic text-foreground/70">
                                "The current trajectory shows a significant uptick in narrative velocity around regional security. Positive sentiment is stabilizing, but neutral reports are increasing in volume..."
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="primary" size="sm" className="w-full text-xs font-bold h-10 tracking-widest uppercase">
                                {t("full_ai_report")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

DashboardGrid.displayName = "DashboardGrid";

export default DashboardGrid;
