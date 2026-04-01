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
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            icon: Activity,
            key: "trend_anomaly",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            icon: Network,
            key: "audience_mapping",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            icon: BarChart3,
            key: "benchmarking",
            color: "text-primary",
            bg: "bg-primary/10",
        }
    ];

    const osintItems = [
        { icon: UserCheck, key: "facial" },
        { icon: Camera, key: "object" },
        { icon: Music, key: "transcription" }
    ];

    return (
        <div className="space-y-32 pb-24 bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative pt-16 overflow-hidden">
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em]"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t("cover_label")}</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-foreground tracking-tight"
                        >
                            {t("title")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground text-xl leading-relaxed max-w-3xl mx-auto"
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
                                className="group p-10 rounded-[2.5rem] bg-card border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors">
                                    {t(`features.${feature.key}.title`)}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed font-light">
                                    {t(`features.${feature.key}.desc`)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Multimedia OSINT Section */}
            <section className="py-24 bg-muted border-y border-border">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-12 max-w-3xl space-y-8 mb-16">
                            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                                {t("features.multimedia_osint.title")}
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
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
                                        className="p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary border border-border">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-bold mb-2 uppercase tracking-wider text-sm">{item.title}</h4>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Advanced Infrastructure Section */}
            <section className="py-24 bg-background">
                <Container>
                    <div className="text-center mb-20 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold text-foreground tracking-tight"
                        >
                            {t("advanced_infrastructure.title")}
                        </motion.h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            {t("advanced_infrastructure.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Monitoring & Coverage */}
                        <div className="space-y-8">
                            {[
                                { key: "global_entity", icon: Activity, color: "text-primary" },
                                { key: "transnational", icon: Globe, color: "text-primary" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="p-8 rounded-3xl bg-card border border-border hover:bg-muted/50 transition-colors group shadow-sm"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${item.color} mb-6 border border-border group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">{t(`advanced_infrastructure.items.${item.key}.title`)}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t(`advanced_infrastructure.items.${item.key}.desc`)}</p>
                                    <div className="pt-4 border-t border-border flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t(`advanced_infrastructure.items.${item.key}.sub`)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Column 2: The Infographic / Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="lg:row-span-2 p-8 rounded-[3rem] bg-card border border-border flex flex-col items-center justify-center text-center overflow-hidden"
                        >
                            <div className="space-y-8 w-full">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{t('visual_data.global_status')}</span>
                                    <h3 className="text-3xl font-bold text-foreground tracking-tight">{t('visual_data.extraction')}</h3>
                                </div>

                                {/* Mock Data Chart / Visual */}
                                <div className="w-full bg-background/50 rounded-2xl p-6 border border-border space-y-4 shadow-inner">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                        <span>{t('visual_data.flow')}</span>
                                        <span className="text-primary">98.4% {t('visual_data.efficiency')}</span>
                                    </div>
                                    <div className="flex items-end justify-between h-20 gap-1">
                                        {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 1 }}
                                                className="flex-1 bg-primary rounded-t-sm"
                                            ></motion.div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="text-start">
                                            <div className="text-lg font-bold text-foreground">12.4M</div>
                                            <div className="text-[8px] text-muted-foreground uppercase tracking-wider">{t('visual_data.entries')}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-lg font-bold text-foreground">~45ms</div>
                                            <div className="text-[8px] text-muted-foreground uppercase tracking-wider">{t('visual_data.latency')}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {['social', 'tv_radio', 'forums'].map((tag) => (
                                        <div key={tag} className="px-3 py-2 rounded-lg bg-card border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            {t(`visual_data.tags.${tag}`)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Column 3: Tech & Security */}
                        <div className="space-y-8">
                            {[
                                { key: "query_eng", icon: Zap, color: "text-primary" },
                                { key: "data_extraction", icon: Zap, color: "text-primary" },
                                { key: "stealth_collection", icon: ShieldAlert, color: "text-primary" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="p-8 rounded-3xl bg-card border border-border hover:bg-muted/50 transition-colors group shadow-sm"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${item.color} mb-6 border border-border group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">{t(`advanced_infrastructure.items.${item.key}.title`)}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t(`advanced_infrastructure.items.${item.key}.desc`)}</p>
                                    <div className="pt-4 border-t border-border flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t(`advanced_infrastructure.items.${item.key}.sub`)}</span>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                            {t("dashboard_section.title")}
                        </h2>
                        <p className="text-muted-foreground text-lg">{t("dashboard_section.subtitle")}</p>
                    </div>
                    <MediaMonitoringDashboard defaultFilter="TV" />
                </Container>
            </section>
        </div>
    );
}
