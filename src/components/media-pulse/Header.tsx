"use client";

import { useTranslations } from "next-intl";
import { Activity, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
    const t = useTranslations("Navigation");
    const tWhy = useTranslations("WhyChooseUs");

    return (
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Activity className="w-7 h-7 text-blue-400" />
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter">
                        {t("media_pulse")}
                    </h1>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-xl max-w-2xl font-light leading-relaxed"
                >
                    {tWhy("sentiment.desc")}
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-6 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl"
            >
                <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    ))}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Status</p>
                    <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Active Safeguard
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
