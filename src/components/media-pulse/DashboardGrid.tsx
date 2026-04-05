"use client";

import { Activity, ShieldAlert, ShieldCheck, Zap, BarChart3, AlertCircle, Globe, Download, FileSpreadsheet, FileText } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import SentimentTracker from "@/components/SentimentTracker";
import { useTranslations } from "next-intl";
import { useMemo, memo, useState } from "react";
import SentimentDonutChart from "./SentimentDonutChart";
import EmotionRadarChart from "./EmotionRadarChart";
import ArticlesTrendChart from "./ArticlesTrendChart";
import { TrendingUp } from "lucide-react";
import { ReportGenerator } from "@/lib/report-generator";
import Button from "@/components/ui/Button";
import { useMessages } from "next-intl";
import { useQuery } from "convex/react";
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
    };
}

export const DashboardGrid = memo(function DashboardGrid({ articles = [], analytics }: DashboardGridProps) {
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

    const sentimentPcts = analytics?.sentimentDistribution ?? {
        Positive: 0,
        Neutral: 0,
        Negative: 0
    };

    const riskScore = analytics?.riskScore ?? 0;
    const nss = analytics?.nss ?? 0;

    const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);

    const handleExport = async (format: 'pdf' | 'excel') => {
        setIsExporting(format);
        try {
            await ReportGenerator.exportPressReleaseReport(articles, messages, format);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(null);
        }
    };

    const isPressRelease = articles.some(a => a.sourceType === 'Press Release');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Pulse View */}
            <div className="lg:col-span-2 space-y-8">
                <section className="p-6 bg-card border border-border rounded-2xl backdrop-blur-3xl relative overflow-hidden group shadow-sm transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <Activity className="w-48 h-48" />
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
                                            <FileText className="w-3.5 h-3.5" />
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
                                            <FileSpreadsheet className="w-3.5 h-3.5" />
                                            EXCEL
                                        </Button>
                                    </div>
                                )}
                                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">{t('real_time')}</div>
                                <div className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center transition-colors">{t('global')}</div>
                            </div>
                        </div>
                        <SentimentTracker articles={articles} />
                    </div>
                </section>

                {/* Reputation Defense Chart */}
                <section className="p-6 rounded-2xl bg-card border border-border transition-colors flex flex-col md:flex-row gap-8 items-center shadow-sm">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center transition-colors">
                                <ShieldAlert className="w-6 h-6 text-destructive" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground transition-colors">{t('reputation_safeguard')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed transition-colors">
                            {t('reputation_desc')}
                        </p>
                        <div className="flex gap-3">
                            <div className="px-3 py-1.5 bg-status-error-bg text-status-error-fg text-[10px] font-bold uppercase tracking-widest rounded-lg border border-status-error/20 transition-colors">{t('total_ave')}: ${(totalAVE / 1000).toFixed(1)}k</div>
                            <div className="px-3 py-1.5 bg-status-success-bg text-status-success-fg text-[10px] font-bold uppercase tracking-widest rounded-lg border border-status-success/20 transition-colors">{articles.length} {t('articles_count')}</div>
                        </div>
                    </div>
                    <div className="w-full md:w-64 h-64 flex flex-col items-center justify-center pt-4">
                        <SentimentDonutChart
                            data={{
                                positive: sentimentPcts.Positive,
                                neutral: sentimentPcts.Neutral,
                                negative: sentimentPcts.Negative
                            }}
                            nssIndex={nss}
                        />
                        <div className="mt-2 text-[10px] font-bold text-destructive flex items-center justify-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            {t('risk')}: {riskScore}%
                        </div>
                    </div>
                </section>
            </div>

            {/* Sidebar / Stats */}
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group transition-colors"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                        <Globe className="w-24 h-24" />
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 opacity-80 italic transition-colors">{t('scope')}</h4>
                    <div className="text-4xl font-bold mb-2 tracking-tighter">
                        {(totalReach / 1000000).toFixed(1)}M+
                    </div>
                    <p className="text-primary-foreground/90 text-xs font-light leading-relaxed transition-colors">{t('scope_desc')}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="p-8 bg-card border border-border rounded-[2rem] space-y-8 shadow-md transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-foreground font-bold text-sm tracking-wider transition-colors">{t('tone_distribution')}</h4>
                        <BarChart3 className="w-4 h-4 text-muted-foreground transition-colors" />
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: t('ToneLabels.positive'), value: sentimentPcts.Positive, color: "bg-status-success", icon: ShieldCheck },
                            { label: t('ToneLabels.neutral'), value: sentimentPcts.Neutral, color: "bg-status-warning", icon: Activity },
                            { label: t('ToneLabels.negative'), value: sentimentPcts.Negative, color: "bg-status-error", icon: AlertCircle },
                        ].map((item) => (
                            <div key={item.label} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground flex items-center gap-2 transition-colors">
                                        <item.icon className="w-3 h-3" />
                                        {item.label}
                                    </span>
                                    <span className="text-foreground bg-muted px-2 py-0.5 rounded-md transition-colors">{item.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-[1px] transition-colors">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${item.value}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={clsx("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", item.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Emotional Pulse Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm transition-colors relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h4 className="text-foreground font-bold text-xs tracking-wider transition-colors">{t('emotional_pulse')}</h4>

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
                            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-primary" />
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
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm transition-colors"
                >
                    <h4 className="text-foreground font-bold text-xs tracking-wider transition-colors">{t('articles_trend')}</h4>
                    <div className="h-[160px] w-full">
                        <ArticlesTrendChart
                            data={articles.length > 0 ? (
                                // Simple transformation for trend if not provided by analytics
                                Object.entries(
                                    articles.reduce((acc: any, a) => {
                                        const date = new Date(a.publishedAt || (a._creationTime)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                        acc[date] = (acc[date] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([date, count]) => ({ date, count: count as number }))
                            ) : [
                                { date: 'Mon', count: 4 },
                                { date: 'Tue', count: 3 },
                                { date: 'Wed', count: 7 },
                                { date: 'Thu', count: 5 },
                                { date: 'Fri', count: 8 },
                            ]}
                        />
                    </div>
                </motion.div>

                {/* Geographic Reach — proper card with ranked bars */}
                {analytics?.geography && Object.keys(analytics.geography).length > 0 && (() => {
                    const geoEntries = Object.entries(analytics.geography)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 5);
                    const maxCount = (geoEntries[0]?.[1] as number) || 1;
                    return (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="p-6 bg-card border border-border rounded-2xl space-y-5 shadow-sm transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-foreground font-bold text-xs tracking-wider flex items-center gap-2 transition-colors">
                                    <Globe className="w-3.5 h-3.5 text-primary" />
                                    {tDashboard('geography')}
                                </h4>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md border border-border transition-colors">
                                    TOP {geoEntries.length}
                                </span>
                            </div>
                            <div className="space-y-3.5">
                                {geoEntries.map(([code, count], index) => {
                                    const pct = Math.round(((count as number) / maxCount) * 100);
                                    return (
                                        <div key={code} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <span className={clsx(
                                                        "inline-flex items-center justify-center min-w-[2.5rem] h-5 px-1.5 rounded text-[9px] font-black uppercase tracking-tight border transition-colors",
                                                        index === 0
                                                            ? "bg-primary text-primary-foreground border-primary/30 shadow-sm shadow-primary/20"
                                                            : "bg-muted text-muted-foreground border-border"
                                                    )}>
                                                        {code}
                                                    </span>
                                                </span>
                                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                                    <span className={clsx("font-black", index === 0 ? "text-primary" : "text-foreground")}>
                                                        {pct}%
                                                    </span>
                                                    {" · "}
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
                    );
                })()}

                <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 shadow-sm transition-all group hover:bg-primary/10">
                    <div className="flex items-center justify-between">
                        <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                        {unreadNotifs && unreadNotifs.length > 0 && (
                            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">{unreadNotifs.length} New</span>
                        )}
                    </div>
                    <h4 className="text-foreground font-bold text-xs transition-colors">{t('automated_alerts')}</h4>

                    {unreadNotifs && unreadNotifs.length > 0 ? (
                        <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                            {unreadNotifs.slice(0, 3).map((notif) => (
                                <div key={notif._id} className="p-2.5 bg-background/60 backdrop-blur-sm rounded-xl border border-border/50 text-[10px] shadow-sm">
                                    <div className="font-bold text-foreground mb-0.5 line-clamp-1">{notif.title}</div>
                                    <div className="text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-[10px] leading-relaxed transition-colors mt-2">
                            {t('alerts_desc')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});
