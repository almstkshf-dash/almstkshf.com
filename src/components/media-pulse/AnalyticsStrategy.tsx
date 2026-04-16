/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface StrategyItem {
    title: string;
    desc: string;
}

export function AnalyticsStrategy() {
    const t = useTranslations("MediaPulseDetail.analytics");

    const sections = [
        {
            key: "reputation",
            icon: ShieldCheck,
            color: "text-emerald-500 dark:text-emerald-400",
            border: "hover:border-emerald-500/30",
        },
        {
            key: "benchmarking",
            icon: TrendingUp,
            color: "text-primary",
            border: "hover:border-primary/30",
        },
        {
            key: "social_analytics",
            icon: Activity,
            color: "text-indigo-500 dark:text-indigo-400",
            border: "hover:border-indigo-500/30",
        },
    ];

    return (
        <section className="space-y-20 border-t border-border pt-32 transition-colors">
            <div className="max-w-4xl space-y-6">
                <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-blue-800 dark:text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
                    {t('strategy_badge')}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight transition-colors">
                    {t("intro.title")}
                </h2>
                <p className="text-foreground/85 text-lg leading-relaxed transition-colors">
                    {t("intro.description")}
                </p>
            </div>

            <div className="space-y-12">
                {sections.map((s) => (
                    <motion.div
                        key={s.key}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={clsx(
                            "p-10 rounded-[3rem] bg-card border border-border transition-all group shadow-lg",
                            s.border
                        )}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("p-3 rounded-xl bg-muted transition-colors", s.color)}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-foreground tracking-tight transition-colors">{t(`${s.key}.title`)}</h3>
                                </div>
                                <p className="text-foreground/80 leading-relaxed font-light transition-colors">
                                    {t(`${s.key}.description`)}
                                </p>
                            </div>
                            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(t.raw(`${s.key}.items`) as StrategyItem[]).map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-muted/30 border border-border space-y-3 group/item hover:bg-muted/50 transition-colors shadow-sm">
                                        <h4 className={clsx("font-bold text-sm uppercase tracking-wider transition-colors", s.color)}>
                                            {item.title}
                                        </h4>
                                        <p className="text-foreground/80 text-xs leading-relaxed group-hover/item:text-foreground transition-colors">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
