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
import { motion, AnimatePresence } from "framer-motion";
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
    BookOpen
} from "lucide-react";
import Button from "@/components/ui/Button";
import ReportLibrary from "@/components/ReportLibrary";

export default function CentralMediaRepositoryClient({
    initialCollections,
    initialSettings,
}: {
    initialCollections?: any[];
    initialSettings?: any;
}) {
    const t = useTranslations("MediaMonitoring.central_media_repository");
    const [activeTab, setActiveTab] = React.useState<"library" | "capabilities">("library");

    const features = [
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

    return (
        <div className="space-y-16 pb-24 bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative pt-16 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em]"
                        >
                            <Database className="w-4 h-4" />
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
                            className="text-foreground/80 text-xl leading-relaxed max-w-3xl mx-auto"
                        >
                            {t("description")}
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* Tab Navigation Segmented Switcher */}
            <section className="relative z-20">
                <Container>
                    <div className="max-w-md mx-auto p-1.5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 flex items-center justify-between gap-1.5 shadow-lg relative">
                        <button
                            onClick={() => setActiveTab("library")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
                                activeTab === "library"
                                    ? "text-primary bg-primary/10 border border-primary/20 shadow-sm"
                                    : "text-foreground/60 hover:text-foreground hover:bg-muted/40 border border-transparent"
                            }`}
                        >
                            <Library className="w-4 h-4" />
                            <span>{t("tabs.saved_collections")}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("capabilities")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
                                activeTab === "capabilities"
                                    ? "text-primary bg-primary/10 border border-primary/20 shadow-sm"
                                    : "text-foreground/60 hover:text-foreground hover:bg-muted/40 border border-transparent"
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
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
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
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
                    <motion.div
                        key="capabilities"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-24"
                    >
                        {/* Content Breakdown */}
                        <section>
                            <Container>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="space-y-8"
                                    >
                                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                                            <FolderTree className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                                            {t("enterprise_hub.title")}
                                        </h2>
                                        <p className="text-foreground/70 text-lg leading-relaxed">
                                            {t("enterprise_hub.description")}
                                        </p>
                                        <ul className="space-y-4 pt-4">
                                            {(t.raw("enterprise_hub.items") as string[]).map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-foreground/70 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="relative group px-1"
                                    >
                                        <div className="absolute -inset-4 bg-primary/10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative aspect-video rounded-3xl bg-card border border-border overflow-hidden shadow-2xl">
                                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse"></div>
                                                        <Database className="w-20 h-20 text-primary relative z-10" />
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
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: "100%" }}
                                                        transition={{ duration: 2, repeat: Infinity }}
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
                                    {features.map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                                <feature.icon className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                                {t(feature.titleKey)}
                                            </h3>
                                            <p className="text-foreground/70 leading-relaxed text-sm">
                                                {t(feature.descKey)}
                                            </p>
                                        </motion.div>
                                    ))}

                                    {/* Placeholder for "And more..." */}
                                    <div className="p-8 rounded-3xl bg-primary/5 border border-blue-500/10 flex flex-col justify-center items-center text-center space-y-4">
                                        <div className="text-primary font-bold uppercase tracking-widest text-xs">{t("advanced_capabilities.transparency")}</div>
                                        <h3 className="text-foreground font-bold text-xl leading-snug">{t("advanced_capabilities.backup_title")}</h3>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 text-primary font-semibold text-sm group h-auto p-0 hover:bg-transparent shadow-none"
                                            rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl-mirror transition-transform" />}
                                        >
                                            {t("advanced_capabilities.learn_more")}
                                        </Button>
                                    </div>
                                </div>
                            </Container>
                        </section>

                        {/* CTA Section */}
                        <section className="py-12">
                            <Container>
                                <div className="p-12 md:p-20 rounded-[4rem] bg-primary/10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <h2 className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight">
                                        {t("cta.title")}
                                    </h2>
                                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                                        {t("cta.subtitle")}
                                    </p>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="px-10 py-5 bg-white text-blue-900 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-2xl h-auto"
                                    >
                                        {t("cta.button")}
                                    </Button>
                                </div>
                            </Container>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
