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
import SentimentDonutChart from "./SentimentDonutChart";
import EmotionRadarChart from "./EmotionRadarChart";
import ArticlesTrendChart from "./ArticlesTrendChart";
import VolumeHeatmapChart from "./VolumeHeatmapChart";
import { TrendingUp } from "lucide-react";
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

const KeywordBadge = memo(function KeywordBadge({ kw }: { kw: string }) {
    const updateKeyword = useMutation(api.monitoring.updateKeyword);
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleEditKeyword = (oldKw: string) => {
        setEditingKeyword(oldKw);
        setEditValue(oldKw);
    };

    const saveKeyword = async (oldKw: string) => {
        if (editValue && editValue.trim() !== oldKw) {
            try {
                await updateKeyword({ oldKeyword: oldKw, newKeyword: editValue.trim() });
            } catch (err) {
                console.error("Failed to update keyword", err);
            }
        }
        setEditingKeyword(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, kw: string) => {
        if (e.key === 'Enter') saveKeyword(kw);
        if (e.key === 'Escape') setEditingKeyword(null);
    };

    return (
        <div className="inline-flex items-center bg-primary/15 text-blue-800 dark:text-blue-300 border border-primary/20 px-3 py-1 rounded-full text-[11px] font-bold transition-colors">
            {editingKeyword === kw ? (
                <>
                    <label htmlFor={`edit-kw-${kw}`} className="sr-only">{t('edit_keyword_hint')}</label>
                    <input
                        id={`edit-kw-${kw}`}
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveKeyword(kw)}
                        onKeyDown={e => handleKeyDown(e, kw)}
                        /* eslint-disable-next-line jsx-a11y/no-autofocus */
                        autoFocus
                        className="bg-transparent border-none outline-none text-primary w-24 p-0 focus:ring-0 text-[11px] font-bold h-4"
                    />
                </>
            ) : (
                <span
                    onDoubleClick={() => handleEditKeyword(kw)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEditKeyword(kw)}
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer hover:underline outline-none focus:ring-1 focus:ring-primary/40 rounded px-0.5"
                    title={t('edit_keyword_hint')}
                    aria-label={`${kw}, ${t('edit_keyword_hint')}`}
                >
                    {kw}
                </span>
            )}
        </div>
    );
});

export const DashboardGrid = memo(function DashboardGrid({ articles = [], analytics, topLeftSlot, topRightSlot }: DashboardGridProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const tDashboard = useTranslations("Dashboard");

    const sentimentDonutT = useTranslations("MediaPulseDetail.sentiment_donut");
    const messages = useMessages();
    const unreadNotifs = useQuery(api.monitoring.getUnreadNotifications);

    // Memoize stats to avoid heavy reduction on every re-render
    const { totalReach, totalAVE } = useMemo(() => {
        return {
            totalReach: analytics?.totalReach ?? articles.reduce((sum, a) => sum + (a.reach || 0), 0),
            totalAVE: articles.reduce((sum, a) => sum + (a.ave || 0), 0)
        };
    }, [articles, analytics]);

    const sentimentPcts = useMemo(() => analytics?.sentimentDistribution ?? {
        Positive: 0,
        Neutral: 0,
        Negative: 0
    }, [analytics?.sentimentDistribution]);

    const riskScore = analytics?.riskScore ?? 0;
    const nss = analytics?.nss ?? 0;

    const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);

    const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
        setIsExporting(format);
        try {
            await ReportGenerator.exportPressReleaseReport(articles, messages, format);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(null);
        }
    }, [articles, messages]);

    const isPressRelease = articles.some(a => a.sourceType === 'Press Release');

    const uniqueKeywords = useMemo(() => {
        return [...new Set(articles.map(a => a.keyword).filter(Boolean))];
    }, [articles]);

    const heatmapData = useMemo(() => {
        if (!articles || articles.length === 0) {
            // Dummy data to show the chart when there are no articles
            return [
                { day: 1, hour: 9, value: 12 },
                { day: 1, hour: 10, value: 25 },
                { day: 2, hour: 14, value: 30 },
                { day: 3, hour: 8, value: 15 },
                { day: 4, hour: 18, value: 40 },
                { day: 5, hour: 11, value: 20 },
            ];
        }

        const counts: Record<string, number> = {};

        // Initialize all combinations to 0
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                counts[`${d}-${h}`] = 0;
            }
        }

        articles.forEach(a => {
            const date = new Date(a.publishedAt || (a as any)._creationTime);
            date.setUTCHours(date.getUTCHours() + 4);
            const day = date.getUTCDay();
            const hour = date.getUTCHours();
            const key = `${day}-${hour}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        const data = [];
        for (const [key, val] of Object.entries(counts)) {
            const [day, hour] = key.split('-').map(Number);
            data.push({ day, hour, value: val });
        }
        return data;
    }, [articles]);
    const trendData = useMemo(() => {
        if (!articles || articles.length === 0) {
            return [
                { date: 'Mon', count: 4 },
                { date: 'Tue', count: 3 },
                { date: 'Wed', count: 7 },
                { date: 'Thu', count: 5 },
                { date: 'Fri', count: 8 },
            ];
        }
        return Object.entries(
            articles.reduce((acc: any, a) => {
                const date = new Date(a.publishedAt || (a._creationTime)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {})
        ).map(([date, count]) => ({ date, count: count as number }));
    }, [articles]);

    const geoEntries = useMemo(() => {
        if (!analytics?.geography) return [];
        return Object.entries(analytics.geography)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5);
    }, [analytics?.geography]);

    const geoMaxCount = useMemo(() => {
        if (geoEntries.length === 0) return 1;
        return (geoEntries[0][1] as number) || 1;
    }, [geoEntries]);

    const toneDistribution = useMemo(() => [
        { label: t('ToneLabels.positive'), value: sentimentPcts.Positive, color: "bg-status-success", icon: ShieldCheck, glow: "shadow-[0_0_15px_rgba(var(--status-success-rgb),0.5)]" },
        { label: t('ToneLabels.neutral'), value: sentimentPcts.Neutral, color: "bg-status-warning", icon: Activity, glow: "shadow-[0_0_15px_rgba(var(--status-warning-rgb),0.5)]" },
        { label: t('ToneLabels.negative'), value: sentimentPcts.Negative, color: "bg-status-error", icon: AlertCircle, glow: "shadow-[0_0_15px_rgba(var(--status-error-rgb),0.5)]" },
    ], [sentimentPcts, t]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Main Pulse View */}
            <div className="xl:col-span-8 space-y-8">
                {topLeftSlot}
                <section className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl transition-all hover:bg-card/80">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none group-hover:scale-110 duration-700">
                        <Activity className="w-48 h-48" aria-hidden="true" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground transition-colors">{t('live_stream')}</h2>
                            <div className="flex items-center gap-2">
                                {isPressRelease && (
                                    <div className="flex items-center gap-2 mr-4 pr-4 border-r border-border">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleExport('pdf')}
                                            disabled={!!isExporting}
                                            isLoading={isExporting === 'pdf'}
                                            className="h-8 text-[10px] uppercase tracking-widest font-bold gap-2 rounded-xl"
                                        >
                                            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                                            PDF
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleExport('excel')}
                                            disabled={!!isExporting}
                                            isLoading={isExporting === 'excel'}
                                            className="h-8 text-[10px] uppercase tracking-widest font-bold gap-2 rounded-xl"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
                                            EXCEL
                                            EXCEL
                                        </Button>
                                    </div>
                                )}
                                <div className="px-3 py-1 bg-primary/15 border border-primary/20 rounded-full text-[10px] font-bold text-blue-800 dark:text-blue-300 transition-colors uppercase tracking-widest">{t('real_time')}</div>
                                <div className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-foreground/80 uppercase tracking-widest text-center transition-colors">{t('global')}</div>
                            </div>
                        </div>

                        {uniqueKeywords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className={clsx("text-[10px] font-bold text-foreground/80 uppercase tracking-widest")}>
                                    {t('keywords')}:
                                </span>
                                {uniqueKeywords.map((kw: string) => (
                                    <KeywordBadge key={kw} kw={kw} />
                                ))}
                            </div>
                        )}

                        <SentimentTracker articles={articles} />
                    </div>
                </section>

                {/* Reputation Defense Chart */}
                <section className="p-6 rounded-2xl bg-card border border-border transition-colors flex flex-col md:flex-row gap-8 items-center shadow-sm">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center transition-colors">
                                <ShieldAlert className="w-6 h-6 text-destructive" aria-hidden="true" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground transition-colors">{t('reputation_safeguard')}</h3>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed transition-colors">
                            {t('reputation_desc')}
                        </p>
                        <div className="flex gap-3">
                            <div className="px-3 py-1.5 bg-status-error-bg text-status-error-fg text-[10px] font-bold uppercase tracking-widest rounded-lg border border-status-error/20 transition-colors">{t('total_ave')}: ${(totalAVE / 1000).toFixed(1)}k</div>
                            <div className="px-3 py-1.5 bg-status-success-bg text-status-success-fg text-[10px] font-bold uppercase tracking-widest rounded-lg border border-status-success/20 transition-colors">{articles.length} {t('articles_count')}</div>
                        </div>
                    </div>
                    <div className="w-full md:w-64 space-y-4">
                        <div className="flex flex-col items-center justify-center">
                            <SentimentDonutChart
                                data={{
                                    positive: sentimentPcts.Positive,
                                    neutral: sentimentPcts.Neutral,
                                    negative: sentimentPcts.Negative
                                }}
                                nssIndex={nss}
                            />
                            <div className="mt-2 text-[10px] font-bold text-destructive dark:text-red-500 flex items-center justify-center gap-1">
                                <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                                {t('risk')}: {riskScore}%
                            </div>
                        </div>

                        {/* Identified Risk Factors */}
                        {analytics?.riskFactors && analytics.riskFactors.length > 0 && (
                            <div className="space-y-2 pt-4 border-t border-border mt-2">
                                <h5 className="text-[9px] font-black uppercase tracking-widest text-foreground/80 mb-3">{t('top_risk_indicators')}</h5>
                                <div className="flex flex-col gap-2">
                                    {analytics.riskFactors.map(factor => (
                                        <div key={factor} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/10 group transition-all hover:bg-destructive/10">
                                            <AlertCircle className="w-3.5 h-3.5 text-destructive animate-pulse" aria-hidden="true" />
                                            <span className="text-[10px] font-bold text-destructive/90 uppercase tracking-tight">
                                                {t(`risk_factors.${factor}`) || factor.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Emotional Pulse Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8 rounded-[2.5rem] space-y-8 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none rotate-12">
                            <Zap className="w-32 h-32 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h4 className="text-foreground font-black text-sm tracking-[0.2em] uppercase">{t('emotional_pulse')}</h4>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="h-[200px] w-full">
                            <EmotionRadarChart
                                data={Object.entries(analytics?.emotions || {}).map(([subject, value]) => ({
                                    subject,
                                    value: value as number,
                                    fullMark: 100
                                }))}
                            />
                        </div>

                        {/* Emotions breakdown table/list */}
                        {analytics?.emotions && Object.keys(analytics.emotions).length > 0 && (
                            <div className="pt-6 border-t border-border mt-2 space-y-4">
                                <h5 className="text-[10px] font-bold text-foreground/80 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-primary" aria-hidden="true" />
                                    {t('top_emotions')}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(analytics.emotions)
                                        .sort(([, a], [, b]) => (b as number) - (a as number))
                                        .slice(0, 4)
                                        .map(([emotion, value]) => (
                                            <div key={emotion} className="group p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-tight">
                                                        {tDashboard(`emotions.${emotion.toLowerCase()}`)}
                                                    </span>
                                                    <span className="text-xs font-black text-primary">{value as number}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${value}%` }}
                                                        className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)] transition-all duration-1000"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-8 rounded-[2.5rem] space-y-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-foreground font-black text-sm tracking-[0.2em] uppercase">{t('articles_trend')}</h4>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-blue-500" aria-hidden="true" />
                            </div>
                        </div>
                        <div className="h-[160px] w-full">
                            <ArticlesTrendChart data={trendData} />
                        </div>
                    </motion.div>
                </div>

                {/* Geographic Reach â€” proper card with ranked bars */}
                {geoEntries.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-8 rounded-[2.5rem] space-y-7 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-foreground font-black text-sm tracking-[0.2em] uppercase flex items-center gap-3">
                                <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
                                {tDashboard('geography')}
                            </h4>
                            <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 transition-colors uppercase tracking-widest bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
                                {tDashboard('top_suffix')} {geoEntries.length}
                            </span>
                        </div>
                        <div className="space-y-3.5">
                            {geoEntries.map(([code, count], index) => {
                                const pct = Math.round(((count as number) / geoMaxCount) * 100);
                                return (
                                    <div key={code} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <span className={clsx(
                                                    "inline-flex items-center justify-center min-w-[2.5rem] h-5 px-1.5 rounded text-[9px] font-black uppercase tracking-tight border transition-colors",
                                                    index === 0
                                                        ? "bg-primary text-primary-foreground border-primary/30 shadow-sm shadow-primary/20"
                                                        : "bg-muted text-foreground/70 border-border"
                                                )}>
                                                    {code}
                                                </span>
                                            </span>
                                            <span className="text-[10px] text-foreground/80 tabular-nums">
                                                <span className={clsx("font-black", index === 0 ? "text-primary" : "text-foreground")}>
                                                    {pct}%
                                                </span>
                                                {" Â· "}
                                                {count as number} {tDashboard('articles_count')}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden transition-colors">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${pct}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.07 }}
                                                className={clsx(
                                                    "h-full rounded-full",
                                                    index === 0
                                                        ? "bg-primary shadow-sm"
                                                        : index === 1
                                                            ? "bg-primary/60"
                                                            : "bg-primary/30"
                                                )}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Sidebar / Stats */}
            <div className="xl:col-span-4 space-y-6">
                {topRightSlot}
            </div>

            <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-8 bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group transition-all flex flex-col justify-center h-full min-h-[250px]"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none duration-500">
                        <Globe className="w-32 h-32" aria-hidden="true" />
                    </div>
                    <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-6 opacity-80 italic transition-colors relative z-10">{t('scope')}</h4>
                    <div className="text-5xl font-black mb-4 tracking-tighter relative z-10">
                        {(totalReach / 1000000).toFixed(1)}{tDashboard('million_suffix')}
                    </div>
                    <p className="text-primary-foreground/90 text-sm font-medium leading-relaxed transition-colors relative z-10">{t('scope_desc')}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8 rounded-[2.5rem] space-y-8 shadow-xl h-full flex flex-col min-h-[250px]"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-foreground font-black text-sm tracking-[0.2em] uppercase">{t('tone_distribution')}</h4>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="w-4 h-4 text-primary" aria-hidden="true" />
                        </div>
                    </div>
                    <div className="space-y-7 flex-1 flex flex-col justify-center">
                        {toneDistribution.map((item) => (
                            <div key={item.label} className="space-y-3 group/item">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.15em]">
                                    <span className="text-foreground/80 flex items-center gap-2 group-hover/item:text-foreground transition-colors">
                                        <item.icon className="w-3.5 h-3.5" aria-hidden="true" />
                                        {item.label}
                                    </span>
                                    <span className="text-foreground bg-muted/50 px-3 py-1 rounded-lg border border-border/50 transition-all group-hover/item:scale-110">{item.value}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden p-[2px] border border-border/30">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${item.value}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.2, ease: "circOut" }}
                                        className={clsx("h-full rounded-full transition-all duration-500", item.color, item.glow)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-[2.5rem] border border-primary/30 bg-primary/5 space-y-4 shadow-xl transition-all group hover:bg-primary/10 relative overflow-hidden h-full flex flex-col min-h-[250px]"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="p-2.5 bg-primary/20 rounded-xl">
                            <Zap className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" aria-hidden="true" />
                        </div>
                        {unreadNotifs && unreadNotifs.length > 0 && (
                            <span className="text-[11px] bg-primary text-primary-foreground px-3 py-1 rounded-full font-black shadow-lg shadow-primary/30 animate-bounce">
                                {unreadNotifs.length} {t('new')}
                            </span>
                        )}
                    </div>
                    <h4 className="text-lg font-black text-foreground transition-colors tracking-tight">{t('automated_alerts')}</h4>

                    <div className="flex-1">
                        {unreadNotifs && unreadNotifs.length > 0 ? (
                            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                                {unreadNotifs.slice(0, 3).map((notif) => (
                                    <div key={notif._id} className="p-2.5 bg-background/60 backdrop-blur-sm rounded-xl border border-border/50 text-[10px] shadow-sm">
                                        <div className="font-bold text-foreground mb-0.5 line-clamp-1">{notif.title}</div>
                                        <div className="text-foreground/70 line-clamp-2 leading-relaxed">{notif.message}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-foreground/70 text-[10px] leading-relaxed transition-colors mt-2">
                                {t('alerts_desc')}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Volume Heatmap (Full Width) */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                className="glass-card p-10 rounded-[3rem] shadow-2xl xl:col-span-12 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary border border-primary/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <Clock className="w-8 h-8" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-2xl font-black text-foreground tracking-tight">{t('volume_heatmap_title')}</h4>
                            <p className="text-sm text-foreground/70 font-medium uppercase tracking-widest">{t('volume_heatmap_desc')}</p>
                        </div>
                    </div>
                </div>
                <VolumeHeatmapChart data={heatmapData} />
            </motion.div>
        </div>
    );
});
