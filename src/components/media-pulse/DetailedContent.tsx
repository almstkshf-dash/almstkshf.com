"use client";

import { useTranslations } from "next-intl";
import { Globe, Zap, AlertCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

export function DetailedContent() {
    const t = useTranslations("MediaPulseDetail");

    const features = [
        { key: "omni_channel", icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
        { key: "ai_analytics", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
        { key: "alerts", icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
        { key: "dashboards", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    ];

    return (
        <>
            {/* Intro & Core Features */}
            <section className="space-y-16">
                <div className="max-w-4xl space-y-6">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight transition-colors">
                        {t("intro.title")}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed transition-colors">
                        {t("intro.description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((f) => (
                        <motion.div
                            key={f.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all group shadow-sm"
                        >
                            <div className="flex gap-6">
                                <div className={clsx("p-4 rounded-2xl shrink-0 h-fit transition-colors", f.bg, f.color)}>
                                    <f.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-foreground uppercase tracking-wider text-sm transition-colors">
                                        {t(`features.${f.key}.title`)}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed transition-colors">
                                        {t(`features.${f.key}.description`)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center text-foreground italic transition-colors"
                >
                    {t("conclusion")}
                </motion.p>
            </section>

            {/* Services Sections */}
            <section className="space-y-24">
                <div className="space-y-6">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
                        {t("dashboard_grid.specialized_services")}
                    </div>
                    <h2 className="text-4xl font-bold text-foreground transition-colors">{t("dashboard_grid.advanced_solutions")}</h2>
                </div>

                {/* Media Monitoring & Social Listening */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-foreground border-l-4 border-primary pl-4 transition-all">
                            {t("services.monitoring.title")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm transition-colors">
                            {t("services.monitoring.description")}
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-foreground border-l-4 border-emerald-500 pl-4 transition-all">
                            {t("services.listening.title")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm transition-colors">
                            {t("services.listening.description")}
                        </p>
                    </div>
                </div>

                {/* Web Monitoring Detail */}
                <div className="p-12 rounded-[3rem] bg-card border border-border space-y-12 shadow-lg transition-all">
                    <div className="max-w-3xl space-y-6">
                        <h3 className="text-3xl font-bold text-foreground transition-colors">{t("services.web.title")}</h3>
                        <p className="text-muted-foreground leading-relaxed transition-colors">
                            {t("services.web.description")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {["multi_platform", "sentiment", "keywords", "competitor"].map((fKey) => (
                            <div key={fKey} className="p-6 rounded-2xl bg-muted/50 border border-border space-y-4 transition-colors">
                                <h4 className="font-bold text-primary uppercase tracking-widest text-[10px] transition-colors">
                                    {t(`services.web.features.${fKey}.title`)}
                                </h4>
                                <p className="text-muted-foreground text-xs leading-relaxed transition-colors">
                                    {t(`services.web.features.${fKey}.description`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
