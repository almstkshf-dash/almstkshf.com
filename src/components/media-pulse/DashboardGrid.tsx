"use client";

import { Activity, ShieldAlert, ShieldCheck, Zap, BarChart3, AlertCircle, Globe } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import SentimentTracker from "@/components/SentimentTracker";
import { useTranslations } from "next-intl";

interface DashboardGridProps {
    articles?: any[];
}

export function DashboardGrid({ articles = [] }: DashboardGridProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");

    // Calculate Stats
    const totalReach = articles.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalAVE = articles.reduce((sum, a) => sum + (a.ave || 0), 0);

    // Sentiment Stats
    const sentimentCounts = articles.reduce((acc, a) => {
        acc[a.sentiment] = (acc[a.sentiment] || 0) + 1;
        return acc;
    }, { Positive: 0, Neutral: 0, Negative: 0 });

    const total = articles.length || 1;
    const sentimentPcts = {
        Positive: Math.round((sentimentCounts.Positive / total) * 100),
        Neutral: Math.round((sentimentCounts.Neutral / total) * 100),
        Negative: Math.round((sentimentCounts.Negative / total) * 100),
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Pulse View */}
            <div className="lg:col-span-2 space-y-8">
                <section className="p-8 bg-card border border-border rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Activity className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-foreground transition-colors">{t('live_stream')}</h2>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">{t('real_time')}</div>
                                <div className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center transition-colors">{t('global')}</div>
                            </div>
                        </div>
                        <SentimentTracker articles={articles} />
                    </div>
                </section>

                {/* Reputation Defense Chart */}
                <section className="p-10 rounded-[2.5rem] bg-card border border-border transition-all flex flex-col md:flex-row gap-12 items-center shadow-lg">
                    <div className="flex-1 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center transition-colors">
                            <ShieldAlert className="w-8 h-8 text-destructive" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground transition-colors">{t('reputation_safeguard')}</h3>
                        <p className="text-muted-foreground leading-relaxed font-light transition-colors">
                            {t('reputation_desc')}
                        </p>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-widest rounded-lg border border-destructive/20 transition-colors">{t('total_ave')}: ${(totalAVE / 1000).toFixed(1)}k</div>
                            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-colors">{articles.length} {t('articles_count')}</div>
                        </div>
                    </div>
                    <div className="w-full md:w-64 h-64 relative flex items-center justify-center">
                        <div className="absolute inset-0 border-[16px] border-muted rounded-full transition-colors"></div>
                        {/* Dynamic safety score based on Positive %? */}
                        <div className="absolute inset-0 border-[16px] border-emerald-500 rounded-full border-t-transparent border-l-transparent rotate-[45deg]" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${sentimentPcts.Positive}%, 0 ${sentimentPcts.Positive}%)` }}></div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-foreground transition-colors">{sentimentPcts.Positive}%</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">{t('positive_sent')}</p>
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
                    className="p-8 bg-gradient-to-br from-primary to-indigo-800 rounded-[2rem] text-primary-foreground shadow-2xl shadow-primary/40 relative overflow-hidden group"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Globe className="w-32 h-32" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-6 opacity-80 italic transition-colors">{t('scope')}</h4>
                    <div className="text-5xl font-bold mb-4 tracking-tighter">
                        {(totalReach / 1000000).toFixed(1)}M+
                    </div>
                    <p className="text-primary-foreground/90 text-sm font-light leading-relaxed transition-colors">{t('scope_desc')}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="p-8 bg-card border border-border rounded-[2rem] space-y-8 shadow-md transition-all"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-foreground font-bold text-sm tracking-wider transition-colors">{t('tone_distribution')}</h4>
                        <BarChart3 className="w-4 h-4 text-muted-foreground transition-colors" />
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: t('ToneLabels.positive'), value: sentimentPcts.Positive, color: "bg-emerald-500", icon: ShieldCheck },
                            { label: t('ToneLabels.neutral'), value: sentimentPcts.Neutral, color: "bg-primary", icon: Activity },
                            { label: t('ToneLabels.negative'), value: sentimentPcts.Negative, color: "bg-destructive", icon: AlertCircle },
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

                <div className="p-8 rounded-[2rem] border border-primary/20 bg-primary/5 space-y-4 shadow-sm transition-all">
                    <Zap className="w-6 h-6 text-primary" />
                    <h4 className="text-foreground font-bold text-sm transition-colors">{t('automated_alerts')}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed transition-colors">
                        {t('alerts_desc')}
                    </p>
                </div>
            </div>
        </div>
    );
}
