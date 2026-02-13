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

            {/* Advanced Infrastructure Section */}
            <section className="py-24 bg-slate-950">
                <Container>
                    <div className="text-center mb-20 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                        >
                            {t("advanced_infrastructure.title")}
                        </motion.h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            {t("advanced_infrastructure.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Monitoring & Coverage */}
                        <div className="space-y-8">
                            {[
                                { key: "global_entity", icon: Activity, color: "text-blue-400" },
                                { key: "transnational", icon: Globe, color: "text-indigo-400" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:bg-slate-900/60 transition-colors group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center ${item.color} mb-6 border border-slate-800 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">{t(`advanced_infrastructure.items.${item.key}.title`)}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{t(`advanced_infrastructure.items.${item.key}.desc`)}</p>
                                    <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t(`advanced_infrastructure.items.${item.key}.sub`)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Column 2: The Infographic / Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="lg:row-span-2 p-8 rounded-[3rem] bg-gradient-to-b from-blue-600/10 to-indigo-600/5 border border-blue-500/20 flex flex-col items-center justify-center text-center overflow-hidden relative"
                        >
                            {/* Animated Background Rings */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[400px] h-[400px] border border-blue-500/30 rounded-full"
                                ></motion.div>
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[300px] h-[300px] border border-dashed border-indigo-500/40 rounded-full"
                                ></motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute w-[200px] h-[200px] bg-blue-500/10 blur-3xl rounded-full"
                                ></motion.div>
                            </div>

                            <div className="relative z-10 space-y-8 w-full">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Global Network Status</span>
                                    <h3 className="text-3xl font-bold text-white tracking-tight">Real-Time Extraction</h3>
                                </div>

                                {/* Mock Data Chart / Visual */}
                                <div className="w-full bg-slate-950/50 rounded-2xl p-6 border border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                                        <span>Data Flow</span>
                                        <span className="text-emerald-400">98.4% Efficiency</span>
                                    </div>
                                    <div className="flex items-end justify-between h-20 gap-1">
                                        {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 1 }}
                                                className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-sm"
                                            ></motion.div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-white">12.4M</div>
                                            <div className="text-[8px] text-slate-500 uppercase tracking-wider">Entries / Hour</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">~45ms</div>
                                            <div className="text-[8px] text-slate-500 uppercase tracking-wider">Latency Delay</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {['Social', 'TV/Radio', 'Forums'].map((tag) => (
                                        <div key={tag} className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Column 3: Tech & Security */}
                        <div className="space-y-8">
                            {[
                                { key: "query_eng", icon: Zap, color: "text-amber-400" },
                                { key: "data_extraction", icon: Zap, color: "text-emerald-400" },
                                { key: "stealth_collection", icon: ShieldAlert, color: "text-rose-400" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:bg-slate-900/60 transition-colors group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center ${item.color} mb-6 border border-slate-800 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">{t(`advanced_infrastructure.items.${item.key}.title`)}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{t(`advanced_infrastructure.items.${item.key}.desc`)}</p>
                                    <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t(`advanced_infrastructure.items.${item.key}.sub`)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Dashboard Integration */}
            <section id="dashboard" className="pt-12 pb-24">
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
