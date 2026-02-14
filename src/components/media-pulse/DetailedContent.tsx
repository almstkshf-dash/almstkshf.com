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
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        {t("intro.title")}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
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
                            className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="flex gap-6">
                                <div className={clsx("p-4 rounded-2xl shrink-0 h-fit", f.bg, f.color)}>
                                    <f.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider text-sm">
                                        {t(`features.${f.key}.title`)}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
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
                    className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center text-slate-300 italic"
                >
                    {t("conclusion")}
                </motion.p>
            </section>

            {/* Services Sections */}
            <section className="space-y-24">
                <div className="space-y-6">
                    <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        {t("dashboard_grid.specialized_services")}
                    </div>
                    <h2 className="text-4xl font-bold text-white">{t("dashboard_grid.advanced_solutions")}</h2>
                </div>

                {/* Media Monitoring & Social Listening */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-4">
                            {t("services.monitoring.title")}
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {t("services.monitoring.description")}
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white border-l-4 border-emerald-500 pl-4">
                            {t("services.listening.title")}
                        </h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {t("services.listening.description")}
                        </p>
                    </div>
                </div>

                {/* Web Monitoring Detail */}
                <div className="p-12 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-12">
                    <div className="max-w-3xl space-y-6">
                        <h3 className="text-3xl font-bold text-white">{t("services.web.title")}</h3>
                        <p className="text-slate-400 leading-relaxed">
                            {t("services.web.description")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {["multi_platform", "sentiment", "keywords", "competitor"].map((fKey) => (
                            <div key={fKey} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                                <h4 className="font-bold text-blue-400 uppercase tracking-widest text-[10px]">
                                    {t(`services.web.features.${fKey}.title`)}
                                </h4>
                                <p className="text-slate-400 text-xs leading-relaxed">
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
