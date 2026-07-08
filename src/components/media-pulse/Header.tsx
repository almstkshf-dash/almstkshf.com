/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import React, { memo } from "react";
import { useTranslations } from "next-intl";
import { Activity, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const SafeguardAvatar = memo(() => (
    <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center transition-colors">
        <ShieldCheck className="w-5 h-5 text-emerald-500" aria-hidden="true" />
    </div>
));

SafeguardAvatar.displayName = "SafeguardAvatar";

export function Header() {
    const t = useTranslations("Navigation");
    const tWhy = useTranslations("WhyChooseUs");
    const shouldReduceMotion = useReducedMotion();

    const slideUpVariants = {
        initial: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
        animate: { opacity: 1, y: 0 }
    };

    const scaleUpVariants = {
        initial: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 },
        animate: { opacity: 1, scale: 1 }
    };

    return (
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <motion.div
                    variants={slideUpVariants}
                    initial="initial"
                    animate="animate"
                    className="flex items-center gap-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-colors">
                        <Activity className="w-7 h-7 text-blue-800 dark:text-blue-300" aria-hidden="true" />
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-foreground tracking-tighter transition-colors">
                        {t("media_pulse")}
                    </h1>
                </motion.div>
                <motion.p
                    variants={slideUpVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                    className="text-foreground/70 text-xl max-w-2xl font-light leading-relaxed transition-colors"
                >
                    {tWhy("sentiment.desc")}
                </motion.p>
            </div>

            <motion.div
                variants={scaleUpVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
                className="flex items-center gap-6 p-4 bg-card border border-border rounded-2xl backdrop-blur-xl shadow-lg transition-all"
            >
                <div className="flex -space-x-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <SafeguardAvatar key={index} />
                    ))}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 transition-colors">
                        {t("system_status")}
                    </p>
                    <p className="text-emerald-500 dark:text-emerald-400 font-bold text-sm flex items-center gap-2 transition-colors">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true"></span>
                        {t("active_safeguard")}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
