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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Database,
    Search,
    Upload,
    UserCheck,
    Tag,
    Share2,
    History,
    ShieldCheck,
    FolderTree,
    ArrowRight,
    Library,
    BookOpen,
    LucideIcon
} from "lucide-react";
import Button from "@/components/ui/Button";
import ReportLibrary from "@/components/ReportLibrary";
import { Doc } from "@/../convex/_generated/dataModel";
import { Link } from "@/i18n/routing";

export type Collection = Doc<"collections">;
export type RepositorySettings = Doc<"app_settings">;

export interface CentralMediaRepositoryClientProps {
    initialCollections?: Collection[];
    initialSettings?: RepositorySettings | null;
}

export type Tab = "library" | "capabilities";

interface FeatureConfig {
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
    color: string;
    bg: string;
}

const CARD_STYLE = "rounded-3xl bg-card border border-border transition-all duration-500";

const FEATURES: FeatureConfig[] = [
    {
        icon: Search,
        titleKey: "features.smart_search.title",
        descKey: "features.smart_search.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: Upload,
        titleKey: "features.bulk_upload.title",
        descKey: "features.bulk_upload.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: UserCheck,
        titleKey: "features.facial_recognition.title",
        descKey: "features.facial_recognition.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: Tag,
        titleKey: "features.labeling_rating.title",
        descKey: "features.labeling_rating.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: Share2,
        titleKey: "features.sharing_access.title",
        descKey: "features.sharing_access.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: History,
        titleKey: "features.versioning_audit.title",
        descKey: "features.versioning_audit.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: ShieldCheck,
        titleKey: "features.secure_storage.title",
        descKey: "features.secure_storage.desc",
        color: "text-primary",
        bg: "bg-primary/10",
    }
];

// Motion presets
const VIEWPORT_ONCE = { once: true };

const getFadeUpVariants = (shouldReduceMotion: boolean, yOffset = 20) => ({
    hidden: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : yOffset,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
});

const getFadeScaleVariants = (shouldReduceMotion: boolean, initialScale = 0.95) => ({
    hidden: {
        opacity: 0,
        scale: shouldReduceMotion ? 1 : initialScale,
    },
    visible: {
        opacity: 1,
        scale: 1,
    },
});

const getFadeSideVariants = (shouldReduceMotion: boolean, xOffset = -30) => ({
    hidden: {
        opacity: 0,
        x: shouldReduceMotion ? 0 : xOffset,
    },
    visible: {
        opacity: 1,
        x: 0,
    },
});

const getTabTransitionVariants = (shouldReduceMotion: boolean) => ({
    hidden: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : 15,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: shouldReduceMotion ? 0 : -15,
    },
});

export default function CentralMediaRepositoryClient({
    initialCollections,
    initialSettings,
}: CentralMediaRepositoryClientProps) {
    const t = useTranslations("MediaMonitoring.central_media_repository");
    const [activeTab, setActiveTab] = React.useState<Tab>("library");
    const shouldReduceMotion = !!useReducedMotion();

    const rawItems = t.raw("enterprise_hub.items");
    const items = Array.isArray(rawItems) ? (rawItems as string[]) : [];

    return (
        <div className="space-y-16 pb-24 bg-background text-foreground">
            {/* Hero Section */}
            <header className="relative pt-16 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={getFadeScaleVariants(shouldReduceMotion, 0.9)}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em]"
                        >
                            <Database aria-hidden="true" className="w-4 h-4" />
                            <span>{t("cover_label")}</span>
                        </motion.div>
                        <motion.h1
                            initial="hidden"
                            animate="visible"
                            variants={getFadeUpVariants(shouldReduceMotion, 30)}
                            transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-foreground tracking-tight"
                        >
                            {t("title")}
                        </motion.h1>
                        <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={getFadeUpVariants(shouldReduceMotion, 30)}
                            transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
                            className="text-foreground/80 text-xl leading-relaxed max-w-3xl mx-auto"
                        >
                            {t("description")}
                        </motion.p>
                    </div>
                </Container>
            </header>

            {/* Tab Navigation Segmented Switcher */}
            <section className="relative z-20">
                <Container>
                    <div 
                        role="tablist" 
                        aria-label={t("tabs.saved_collections") + " / " + t("tabs.capabilities")} 
                        className="max-w-md mx-auto p-1.5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 flex items-center justify-between gap-1.5 shadow-lg relative"
                    >
                        <button
                            role="tab"
                            aria-selected={activeTab === "library"}
                            aria-controls="library-panel"
                            id="library-tab"
                            onClick={() => setActiveTab("library")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
                                activeTab === "library"
                                    ? "text-primary bg-primary/10 border border-primary/20 shadow-sm"
                                    : "text-foreground/60 hover:text-foreground hover:bg-muted/40 border border-transparent"
                            }`}
                        >
                            <Library aria-hidden="true" className="w-4 h-4" />
                            <span>{t("tabs.saved_collections")}</span>
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "capabilities"}
                            aria-controls="capabilities-panel"
                            id="capabilities-tab"
                            onClick={() => setActiveTab("capabilities")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
                                activeTab === "capabilities"
                                    ? "text-primary bg-primary/10 border border-primary/20 shadow-sm"
                                    : "text-foreground/60 hover:text-foreground hover:bg-muted/40 border border-transparent"
                            }`}
                        >
                            <BookOpen aria-hidden="true" className="w-4 h-4" />
                            <span>{t("tabs.capabilities")}</span>
                        </button>
                    </div>
                </Container>
            </section>

            {/* Animated Tab Content Container */}
            <AnimatePresence mode="wait">
                {activeTab === "library" ? (
                    <motion.section
                        key="library"
                        id="library-panel"
                        role="tabpanel"
                        aria-labelledby="library-tab"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={getTabTransitionVariants(shouldReduceMotion)}
                        transition={{ duration: 0.25 }}
                    >
                        <Container>
                            <div className="bg-card/30 backdrop-blur-sm border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                                <ReportLibrary 
                                    initialCollections={initialCollections}
                                    initialSettings={initialSettings}
                                />
                            </div>
                        </Container>
                    </motion.section>
                ) : (
                    <motion.section
                        key="capabilities"
                        id="capabilities-panel"
                        role="tabpanel"
                        aria-labelledby="capabilities-tab"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={getTabTransitionVariants(shouldReduceMotion)}
                        transition={{ duration: 0.25 }}
                        className="space-y-24"
                    >
                        {/* Content Breakdown */}
                        <section>
                            <Container>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    <motion.div
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={VIEWPORT_ONCE}
                                        variants={getFadeSideVariants(shouldReduceMotion, -30)}
                                        className="space-y-8"
                                    >
                                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                                            <FolderTree aria-hidden="true" className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                                            {t("enterprise_hub.title")}
                                        </h2>
                                        <p className="text-foreground/70 text-lg leading-relaxed">
                                            {t("enterprise_hub.description")}
                                        </p>
                                        <ul className="space-y-4 pt-4">
                                            {items.map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-foreground/70 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    <motion.div
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={VIEWPORT_ONCE}
                                        variants={getFadeScaleVariants(shouldReduceMotion, 0.95)}
                                        className="relative group px-1"
                                    >
                                        <div className="absolute -inset-4 bg-primary/10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className={`relative ${CARD_STYLE} aspect-video overflow-hidden shadow-2xl`}>
                                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <div className={`absolute inset-0 bg-primary/30 blur-2xl rounded-full ${shouldReduceMotion ? '' : 'animate-pulse'}`}></div>
                                                        <Database aria-hidden="true" className="w-20 h-20 text-primary relative z-10" />
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <div className="text-foreground font-bold tracking-wider">{t("visual_labels.secure_vault")}</div>
                                                        <div className="text-primary text-xs font-mono">{t("visual_labels.encrypting")}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: shouldReduceMotion ? "100%" : 0 }}
                                                        whileInView={shouldReduceMotion ? {} : { width: "100%" }}
                                                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 2, repeat: 3 }}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </Container>
                        </section>

                        {/* Features Grid */}
                        <section className="bg-muted/30 py-24 border-y border-border">
                            <Container>
                                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                                    <h2 className="text-4xl font-bold text-foreground tracking-tight">{t("advanced_capabilities.title")}</h2>
                                    <p className="text-foreground/70 text-lg">{t("advanced_capabilities.subtitle")}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {FEATURES.map((feature, idx) => (
                                        <motion.div
                                            key={feature.titleKey}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={VIEWPORT_ONCE}
                                            variants={getFadeUpVariants(shouldReduceMotion, 20)}
                                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.1 }}
                                            className={`group p-8 ${CARD_STYLE} hover:border-primary/30 shadow-sm hover:shadow-xl`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 ${shouldReduceMotion ? '' : 'group-hover:scale-110 transition-transform duration-500'}`}>
                                                <feature.icon aria-hidden="true" className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                                {t(feature.titleKey as any)}
                                            </h3>
                                            <p className="text-foreground/70 leading-relaxed text-sm">
                                                {t(feature.descKey as any)}
                                            </p>
                                        </motion.div>
                                    ))}

                                    {/* Placeholder for "And more..." */}
                                    <div className="p-8 rounded-3xl bg-primary/5 border border-blue-500/10 flex flex-col justify-center items-center text-center space-y-4">
                                        <div className="text-primary font-bold uppercase tracking-widest text-xs">{t("advanced_capabilities.transparency")}</div>
                                        <h3 className="text-foreground font-bold text-xl leading-snug">{t("advanced_capabilities.backup_title")}</h3>
                                        <Link href="/contact" passHref>
                                            <Button
                                                variant="ghost"
                                                className="flex items-center gap-2 text-primary font-semibold text-sm group h-auto p-0 hover:bg-transparent shadow-none"
                                                rightIcon={<ArrowRight aria-hidden="true" className={`w-4 h-4 rtl-mirror ${shouldReduceMotion ? '' : 'group-hover:translate-x-1 transition-transform'}`} />}
                                            >
                                                {t("advanced_capabilities.learn_more")}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Container>
                        </section>

                        {/* CTA Section */}
                        <section className="py-12">
                            <Container>
                                <div className="p-12 md:p-20 rounded-[4rem] bg-primary/10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <h2 className="text-4xl md:text-6xl font-bold text-foreground max-w-3xl leading-tight">
                                        {t("cta.title")}
                                    </h2>
                                    <p className="text-foreground/80 text-lg md:text-xl max-w-2xl">
                                        {t("cta.subtitle")}
                                    </p>
                                    <Link href="/contact" passHref>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl h-auto"
                                        >
                                            {t("cta.button")}
                                        </Button>
                                    </Link>
                                </div>
                            </Container>
                        </section>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
}
