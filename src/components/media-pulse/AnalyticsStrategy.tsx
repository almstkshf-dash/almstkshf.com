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
            color: "text-emerald-400",
            border: "hover:border-emerald-500/30",
        },
        {
            key: "benchmarking",
            icon: TrendingUp,
            color: "text-blue-400",
            border: "hover:border-blue-500/30",
        },
        {
            key: "social_analytics",
            icon: Activity,
            color: "text-indigo-400",
            border: "hover:border-indigo-500/30",
        },
    ];

    return (
        <section className="space-y-20 border-t border-slate-900 pt-32">
            <div className="max-w-4xl space-y-6">
                <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Strategy & Insights
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                    {t("intro.title")}
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
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
                            "p-10 rounded-[3rem] bg-slate-900/30 border border-slate-800 transition-all group",
                            s.border
                        )}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-5 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("p-3 rounded-xl bg-slate-800/50", s.color)}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white tracking-tight">{t(`${s.key}.title`)}</h3>
                                </div>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    {t(`${s.key}.description`)}
                                </p>
                            </div>
                            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(t.raw(`${s.key}.items`) as StrategyItem[]).map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 group/item hover:bg-slate-900 transition-colors">
                                        <h4 className={clsx("font-bold text-sm uppercase tracking-wider", s.color)}>
                                            {item.title}
                                        </h4>
                                        <p className="text-slate-500 text-xs leading-relaxed group-hover/item:text-slate-400 transition-colors">
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
