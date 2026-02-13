"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    ShieldCheck,
    Activity,
    Zap,
    BarChart3,
    TrendingUp,
    Users,
    Network,
    Camera,
    UserCheck,
    Music,
    Search,
    Globe
} from "lucide-react";
import MediaMonitoringDashboard from "./MediaMonitoringDashboard";

export default function CrisisManagementClient() {
    const t = useTranslations("CrisisManagementDetail");

    const coreFeatures = [
        {
            icon: ShieldAlert,
            key: "intelligence_sentiment",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
        },
        {
            icon: Activity,
            key: "trend_anomaly",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            icon: Network,
            key: "audience_mapping",
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
        },
        {
            icon: BarChart3,
            key: "benchmarking",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        }
    ];

    const osintItems = [
        { icon: UserCheck, key: "facial" },
        { icon: Camera, key: "object" },
        { icon: Music, key: "transcription" }
    ];

    return (
        <div className="space-y-32 pb-24">
            {/* Hero Section */}
            <section className="relative pt-16 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-rose-600/10 blur-[120px] rounded-full -z-10"></div>
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-[0.2em]"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t("cover_label")}</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-white tracking-tight"
                        >
                            {t("title")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-xl leading-relaxed max-w-3xl mx-auto"
                        >
                            {t("description")}
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* Core Strategy Grid */}
            <section>
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {coreFeatures.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 hover:border-rose-500/30 transition-all duration-500 backdrop-blur-3xl"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-rose-400 transition-colors">
                                    {t(`features.${feature.key}.title`)}
                                </h3>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    {t(`features.${feature.key}.desc`)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Multimedia OSINT Section */}
            <section className="relative py-24 bg-slate-900/20 border-y border-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                <Container className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-12 max-w-3xl space-y-8 mb-16">
                            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                {t("features.multimedia_osint.title")}
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                {t("features.multimedia_osint.desc")}
                            </p>
                        </div>

                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {(t.raw("features.multimedia_osint.items") as any[]).map((item, idx) => {
                                const Icon = osintItems[idx].icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm">{item.title}</h4>
                                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Dashboard Integration */}
            <section id="dashboard" className="pt-12">
                <Container>
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                            Operational Intelligence
                        </h2>
                        <p className="text-slate-500 text-lg">Real-time monitoring and active crisis plans in your jurisdiction.</p>
                    </div>
                    <MediaMonitoringDashboard defaultFilter="TV" />
                </Container>
            </section>
        </div>
    );
}
