/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useTranslations, useLocale } from "next-intl";
import Container from "@/components/ui/Container";
import { Key, Database, Zap, ArrowRight, Server, Globe, Slack, Webhook, Users, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from '@/i18n/routing';
import { Integration } from "@/types/integration";
import { defaultIntegrations } from "@/data/integrations";
import clsx from "clsx";

const iconMap: Record<string, LucideIcon> = {
    Slack,
    Webhook,
    Database,
    Users,
    Mail,
};

export default function IntegrationClient({
    initialIntegrations,
}: {
    initialIntegrations?: Integration[];
}) {
    const t = useTranslations("TechnicalSolutions.integration");
    const tNav = useTranslations("Navigation");
    const locale = useLocale();

    const integrations = (initialIntegrations || defaultIntegrations)
        .filter(item => item.active);

    const codeSnippet = `const almstkshf = require('almstkshf-sdk');

// Initialize with your API Key
const client = new almstkshf.Client(process.env.API_KEY);

// Fetch real-time broadcast sentiment
const sentiment = await client.media.getSentiment({
  source: 'TV',
  keywords: ['BrandName', 'Competitor'],
  realtime: true
});

console.log(sentiment.score); // 0.85 (Positive)`;

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background overflow-hidden">
            {/* Background Gradients — theme-aware */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-background/50 to-background pointer-events-none"></div>
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <Container className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold uppercase tracking-widest"
                        >
                            <Key className="w-4 h-4" />
                            <span>API & Webhooks</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight"
                        >
                            {t("title")}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground leading-relaxed"
                        >
                            {t("intro")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                href="/contact"
                                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 flex items-center gap-2"
                            >
                                {tNav("contact")}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Code Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary/5 blur-2xl rounded-3xl"></div>
                        <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                            {/* Code editor top bar */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ms-2 text-xs text-muted-foreground font-mono">integration.js</span>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm text-foreground/80 leading-relaxed">
                                    <code>{codeSnippet}</code>
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { id: "modular", icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { id: "realtime", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { id: "compatibility", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                    ].map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="p-8 bg-card border border-border rounded-3xl hover:bg-muted/50 transition-all hover:border-border/80 group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">{t(`features.${feature.id}.title`)}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t(`features.${feature.id}.desc`)}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Ecosystem Section */}
                <div className="mt-28 space-y-12">
                    <div className="text-center space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-foreground tracking-tight"
                        >
                            {t("ecosystem_title")}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto"
                        >
                            {t("ecosystem_subtitle")}
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {integrations.map((item: Integration, idx: number) => {
                            const IconComponent = iconMap[item.icon] || Globe;
                            const name = t(`list.${item.id}.name`);
                            const desc = t(`list.${item.id}.desc`);
                            const category = t(`list.${item.id}.category`);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="relative p-8 bg-card/50 backdrop-blur-sm border border-border/80 rounded-3xl hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <IconComponent className="w-6 h-6 text-primary" />
                                            </div>
                                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                                                {category}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3">
                                            {name}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                            {desc}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/contact?ref=integration_${item.id}`}
                                        className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:underline"
                                    >
                                        <span>{t("details")}</span>
                                        <ArrowRight className={clsx(
                                            "w-4 h-4 transition-transform duration-300",
                                            locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                                        )} />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Architecture Diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 p-12 rounded-[3rem] bg-card border border-border text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-foreground mb-12 relative z-10">{t("subtitle")}</h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-border flex items-center justify-center">
                                <Server className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Your System</span>
                        </div>

                        <div className="flex items-center gap-2 text-primary animate-pulse">
                            <div className="h-1 w-12 md:w-24 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                            <ArrowRight className="w-6 h-6" />
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="w-10 h-10 text-primary" />
                            </div>
                            <span className="font-bold text-foreground uppercase tracking-widest">ALMSTKSHF API</span>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </main>
    );
}
