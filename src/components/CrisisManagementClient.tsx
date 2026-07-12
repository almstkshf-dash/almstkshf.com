/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

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
    Network,
    Camera,
    UserCheck,
    Music,
    Globe
} from "lucide-react";
import MediaMonitoringDashboard from "./MediaMonitoringDashboard";
import { Doc } from "@/../convex/_generated/dataModel";

export type Report = Doc<"media_monitoring_articles">;
export type DashboardSettings = Doc<"app_settings">;
export type CrisisPlan = Doc<"crisis_plans">;

export interface CrisisManagementClientProps {
    initialReports?: Report[];
    initialSettings?: DashboardSettings | null;
    initialCrisisPlans?: CrisisPlan[];
}

// Reusable Class and Delay Constants
const CARD_CLASSES = "p-8 rounded-3xl bg-card border border-border transition-colors group shadow-sm";
const CARD_DELAY_BASE = 0.15;
const INFRA_DELAY_BASE = 0.2;

const MOCK_STATS = {
    flowEfficiency: "98.4%",
    flowEntries: "12.4M",
    latency: "~45ms"
};

const MOCK_VISUAL_BARS = [40, 70, 45, 90, 65, 80, 55, 95, 75, 60];

// Static Data Structures
type FeatureKey =
    | "intelligence_sentiment"
    | "trend_anomaly"
    | "audience_mapping"
    | "benchmarking";

interface Feature {
    icon: React.ComponentType<{ className?: string }>;
    key: FeatureKey;
    color: string;
    bg: string;
}

const CORE_FEATURES: Feature[] = [
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

interface OsintConfig {
    icon: React.ComponentType<{ className?: string }>;
    key: string;
}

const OSINT_ITEMS: OsintConfig[] = [
    { icon: UserCheck, key: "facial" },
    { icon: Camera, key: "object" },
    { icon: Music, key: "transcription" }
];

interface InfraItem {
    key: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const INFRA_LEFT: InfraItem[] = [
    { key: "global_entity", icon: Activity, color: "text-primary" },
    { key: "transnational", icon: Globe, color: "text-primary" }
];

const INFRA_RIGHT: InfraItem[] = [
    { key: "query_eng", icon: Zap, color: "text-primary" },
    { key: "data_extraction", icon: Zap, color: "text-primary" },
    { key: "stealth_collection", icon: ShieldAlert, color: "text-primary" }
];

// Motion Variants Presets
const getFadeUpVariants = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { delay, duration: 0.5, ease: "easeOut" as const }
    }
});

const getFadeScaleVariants = () => ({
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" as const }
    }
});

// Modular Sub-Components
function HeroSection() {
    const t = useTranslations("CrisisManagementDetail");
    return (
        <section className="relative pt-16 overflow-hidden">
            <Container>
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={getFadeScaleVariants()}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em]"
                    >
                        <ShieldCheck aria-hidden="true" className="w-4 h-4" />
                        <span>{t("cover_label")}</span>
                    </motion.div>
                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={getFadeUpVariants(0.1)}
                        className="text-5xl md:text-7xl font-bold text-foreground tracking-tight"
                    >
                        {t("title")}
                    </motion.h1>
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={getFadeUpVariants(0.2)}
                        className="text-foreground/80 text-xl leading-relaxed max-w-3xl mx-auto"
                    >
                        {t("description")}
                    </motion.p>
                </div>
            </Container>
        </section>
    );
}

interface FeatureCardProps {
    feature: Feature;
    index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
    const t = useTranslations("CrisisManagementDetail");
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={getFadeUpVariants(index * CARD_DELAY_BASE)}
            className="group p-10 rounded-[2.5rem] bg-card border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
        >
            <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon aria-hidden="true" className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors">
                {t(`features.${feature.key}.title`)}
            </h3>
            <p className="text-foreground/80 leading-relaxed font-light">
                {t(`features.${feature.key}.desc`)}
            </p>
        </motion.div>
    );
}

function CoreStrategySection() {
    return (
        <section>
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {CORE_FEATURES.map((feature, idx) => (
                        <FeatureCard key={feature.key} feature={feature} index={idx} />
                    ))}
                </div>
            </Container>
        </section>
    );
}

function OsintSection() {
    const t = useTranslations("CrisisManagementDetail");
    const rawOsintItems = t.raw("features.multimedia_osint.items");
    const osintItemsList = Array.isArray(rawOsintItems) ? rawOsintItems : [];

    return (
        <section className="py-24 bg-muted border-y border-border">
            <Container>
                <div className="space-y-16">
                    <div className="max-w-3xl space-y-8">
                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                            <Globe aria-hidden="true" className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                            {t("features.multimedia_osint.title")}
                        </h2>
                        <p className="text-foreground/80 text-lg leading-relaxed">
                            {t("features.multimedia_osint.desc")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {osintItemsList.map((item: any, idx) => {
                            const Icon = OSINT_ITEMS[idx]?.icon ?? Globe;
                            return (
                                <motion.div
                                    key={item.title || idx}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={getFadeScaleVariants()}
                                    className="p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary border border-border">
                                        <Icon aria-hidden="true" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-bold mb-2 uppercase tracking-wider text-sm">{item.title}</h4>
                                        <p className="text-foreground/70 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </Container>
        </section>
    );
}

interface InfrastructureCardProps {
    item: InfraItem;
    index: number;
}

function InfrastructureCard({ item, index }: InfrastructureCardProps) {
    const t = useTranslations("CrisisManagementDetail");
    const infraItems = t.raw("advanced_infrastructure" as any).items as Record<string, { title?: string; desc?: string; sub?: string }>;
    const translation = infraItems[item.key] ?? {};
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={getFadeUpVariants(index * INFRA_DELAY_BASE)}
            className={CARD_CLASSES}
        >
            <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${item.color} mb-6 border border-border group-hover:scale-110 transition-transform`}>
                <item.icon aria-hidden="true" className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">{translation.title ?? ""}</h3>
            <p className="text-foreground/70 text-sm leading-relaxed mb-6">{translation.desc ?? ""}</p>
            <div className="pt-4 border-t border-border flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">{translation.sub ?? ""}</span>
            </div>
        </motion.div>
    );
}

function InfrastructureSection() {
    const t = useTranslations("CrisisManagementDetail");
    return (
        <section className="py-24 bg-background">
            <Container>
                <div className="text-center mb-20 space-y-4">
                    <motion.h2
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={getFadeUpVariants(0.1)}
                        className="text-4xl md:text-6xl font-bold text-foreground tracking-tight"
                    >
                        {t("advanced_infrastructure.title")}
                    </motion.h2>
                    <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
                        {t("advanced_infrastructure.subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Monitoring & Coverage */}
                    <div className="space-y-8">
                        {INFRA_LEFT.map((item, idx) => (
                            <InfrastructureCard key={item.key} item={item} index={idx} />
                        ))}
                    </div>

                    {/* Column 2: The Infographic / Visual */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={getFadeScaleVariants()}
                        className="lg:row-span-2 p-8 rounded-[3rem] bg-card border border-border flex flex-col items-center justify-center text-center overflow-hidden"
                    >
                        <div className="space-y-8 w-full">
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">{t('visual_data.global_status')}</span>
                                <h3 className="text-3xl font-bold text-foreground tracking-tight">{t('visual_data.extraction')}</h3>
                            </div>

                            {/* Mock Data Chart / Visual */}
                            <div className="w-full bg-background/50 rounded-2xl p-6 border border-border space-y-4 shadow-inner">
                                <div className="flex items-center justify-between text-[10px] font-bold text-foreground/70 uppercase">
                                    <span>{t('visual_data.flow')}</span>
                                    <span className="text-primary">{MOCK_STATS.flowEfficiency} {t('visual_data.efficiency')}</span>
                                </div>
                                <div className="flex items-end justify-between h-20 gap-1">
                                    {MOCK_VISUAL_BARS.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05, duration: 1 }}
                                            className="flex-1 bg-primary rounded-t-sm"
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="text-start">
                                        <div className="text-lg font-bold text-foreground">{MOCK_STATS.flowEntries}</div>
                                        <div className="text-[8px] text-foreground/70 uppercase tracking-wider">{t('visual_data.entries')}</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="text-lg font-bold text-foreground">{MOCK_STATS.latency}</div>
                                        <div className="text-[8px] text-foreground/70 uppercase tracking-wider">{t('visual_data.latency')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {['social', 'tv_radio', 'forums'].map((tag) => {
                                    const tagKeys: Record<string, any> = {
                                        social: 'visual_data.tags.social',
                                        tv_radio: 'visual_data.tags.tv_radio',
                                        forums: 'visual_data.tags.forums'
                                    };
                                    return (
                                        <div key={tag} className="px-3 py-2 rounded-lg bg-card border border-border text-[10px] font-bold text-foreground/70 uppercase tracking-tighter">
                                            {t(tagKeys[tag])}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Column 3: Tech & Security */}
                    <div className="space-y-8">
                        {INFRA_RIGHT.map((item, idx) => (
                            <InfrastructureCard key={item.key} item={item} index={idx} />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}

interface DashboardSectionProps {
    initialReports?: Report[];
    initialSettings?: DashboardSettings | null;
    initialCrisisPlans?: CrisisPlan[];
}

function DashboardSection({ initialReports, initialSettings, initialCrisisPlans }: DashboardSectionProps) {
    const t = useTranslations("CrisisManagementDetail");
    return (
        <section id="dashboard" className="pt-12 pb-24">
            <Container>
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                        {t("dashboard_section.title")}
                    </h2>
                    <p className="text-foreground/80 text-lg">{t("dashboard_section.subtitle")}</p>
                </div>
                <MediaMonitoringDashboard 
                    defaultFilter="TV" 
                    {...{
                        initialReports,
                        initialSettings,
                        initialCrisisPlans
                    }}
                />
            </Container>
        </section>
    );
}

export default function CrisisManagementClient({
    initialReports,
    initialSettings,
    initialCrisisPlans,
}: CrisisManagementClientProps) {
    return (
        <div className="space-y-32 pb-24 bg-background text-foreground">
            <HeroSection />
            <CoreStrategySection />
            <OsintSection />
            <InfrastructureSection />
            <DashboardSection 
                initialReports={initialReports}
                initialSettings={initialSettings}
                initialCrisisPlans={initialCrisisPlans}
            />
        </div>
    );
}
