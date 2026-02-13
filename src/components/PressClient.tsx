"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import MediaMonitoringDashboard from "@/components/MediaMonitoringDashboard";
import { motion } from "framer-motion";
import { Newspaper, Bell, Send, BarChart, Globe, Layout, Search, Mail, Users, Clock } from "lucide-react";

export default function PressClient() {
    const t = useTranslations("MediaMonitoring.press");

    const features = [
        {
            icon: Globe,
            titleKey: "features.digital_print.title",
            descKey: "features.digital_print.desc",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            icon: Send,
            titleKey: "features.publisher.title",
            descKey: "features.publisher.desc",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            icon: BarChart,
            titleKey: "features.analytics.title",
            descKey: "features.analytics.desc",
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
        },
        {
            icon: Bell,
            titleKey: "features.alerts.title",
            descKey: "features.alerts.desc",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        }
    ];

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative pt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-600/10 blur-[120px] rounded-full -z-10"></div>
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest"
                        >
                            <Newspaper className="w-3 h-3" />
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

            {/* Features Grid */}
            <section>
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group"
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-white tracking-tight">{t(feature.titleKey)}</h3>
                                        <p className="text-slate-400 leading-relaxed text-sm">
                                            {t(feature.descKey)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Persona Section (Noor) */}
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

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                        {t("use_cases.noor.role")}
                                    </div>
                                    <h3 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {t("use_cases.noor.title")}
                                    </h3>
                                </div>

                                <div className="prose prose-invert prose-emerald max-w-none text-slate-400 leading-relaxed">
                                    {t("use_cases.noor.scenario").split('\n\n').map((paragraph, i) => (
                                        <p key={i} className="mb-4">{paragraph}</p>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        <span>Daily/Weekly/Monthly Reports</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300">
                                        <Users className="w-4 h-4 text-emerald-400" />
                                        <span>Journalist Contact List</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                    <div className="flex flex-col items-center gap-6 text-slate-500 p-8 text-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                                            <Newspaper className="w-20 h-20 text-emerald-400 relative z-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] block">Press Intelligence</span>
                                            <p className="text-sm text-slate-500 italic">"Everything in one place: monitoring, social listening, and distribution."</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                                                <div className="text-emerald-400 font-bold text-lg">98%</div>
                                                <div className="text-[10px] uppercase text-slate-500">Pick-up Rate</div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                                                <div className="text-emerald-400 font-bold text-lg">24/7</div>
                                                <div className="text-[10px] uppercase text-slate-500">Monitoring</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Interactive Dashboard Section */}
            <section className="bg-slate-950 py-24 border-t border-slate-900">
                <Container>
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Media Monitoring Console</h2>
                        <p className="text-slate-500">Access your latest reports and crisis management plans below.</p>
                    </div>
                    <MediaMonitoringDashboard defaultFilter="Press" />
                </Container>
            </section>
        </div>
    );
}
