"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import MediaMonitoringDashboard from "@/components/MediaMonitoringDashboard";
import { motion } from "framer-motion";
import { Globe, Bell, Scissors, Target, Radio, Monitor, Zap } from "lucide-react";

export default function TvRadioClient() {
    const t = useTranslations("MediaMonitoring.tv_radio");

    const features = [
        {
            icon: Globe,
            titleKey: "analytics", // This text is long, I'll use it as a title or split it
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            icon: Bell,
            titleKey: "alerts",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            icon: Scissors,
            titleKey: "clips",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            icon: Target,
            titleKey: "custom_profiles",
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
        }
    ];

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative pt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
                        >
                            <Radio className="w-3 h-3" />
                            <span>{t("cover_label")}</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                        >
                            {t("title")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-lg leading-relaxed max-w-3xl mx-auto"
                        >
                            {t("description")}
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* Core Stats / Feature Grid */}
            <section>
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Global Analytics Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{t('channels_stats')}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t("analytics")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Real-time Alerts */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all group"
                        >
                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                                    <Bell className="w-8 h-8" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{t("alerts.title")}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t("alerts.description")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Clip Editor */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group"
                        >
                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Scissors className="w-8 h-8" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{t("clips.title")}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t("clips.description")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Media Pulse Integration */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group"
                        >
                            <div className="flex items-start gap-6">
                                <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{t("media_pulse_integration.title")}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t("media_pulse_integration.description")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Detailed Analysis Section (Custom Profiles) */}
                    <div className="mt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{t("custom_profiles.title")}</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed">
                                        {t("custom_profiles.description")}
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300">
                                            <Monitor className="w-4 h-4 text-blue-400" />
                                            <span>{t('real_time_clips')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            <span>{t('immediate_alerts')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                        <div className="flex flex-col items-center gap-4 text-slate-500">
                                            <Radio className="w-12 h-12 animate-pulse" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{t('global_stream')}</span>
                                        </div>
                                    </div>
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Use Case Scenarios Section */}
            <section className="py-24 border-t border-slate-900">
                <Container>
                    <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            {t("use_cases.title")}
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            {t("use_cases.intro")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {["case1", "case2", "case3", "case4"].map((caseId, idx) => (
                            <motion.div
                                key={caseId}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 hover:bg-slate-900/60 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {t(`use_cases.items.${caseId}.title`)}
                                        </h3>
                                        <p className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                                            {t(`use_cases.items.${caseId}.role`)}
                                        </p>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t(`use_cases.items.${caseId}.scenario`)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 p-8 rounded-[2rem] bg-blue-600/5 border border-blue-500/20 text-center"
                    >
                        <p className="text-blue-100/80 italic leading-relaxed max-w-4xl mx-auto">
                            "{t("use_cases.conclusion")}"
                        </p>
                    </motion.div>
                </Container>
            </section>

            {/* Interactive Dashboard Section */}
            <section className="bg-slate-950 py-24 border-t border-slate-900">
                <Container>
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">{t('console_title')}</h2>
                        <p className="text-slate-500">{t('console_desc')}</p>
                    </div>
                    <MediaMonitoringDashboard defaultFilter="TV" />
                </Container>
            </section>
        </div>
    );
}
