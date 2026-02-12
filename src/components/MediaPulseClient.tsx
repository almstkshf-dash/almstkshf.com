"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import SentimentTracker from "@/components/SentimentTracker";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function MediaPulseClient() {
    const t = useTranslations("Navigation");

    return (
        <main className="min-h-screen pt-32 pb-20">
            <Container>
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                            {t("media_pulse")}
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg max-w-2xl"
                    >
                        Real-time tracking of public perception and brand health across thousands of global and regional media sources.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Pulse View */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
                            <SentimentTracker />
                        </section>

                        {/* Placeholder for future detailed chart */}
                        <section className="h-64 rounded-3xl bg-slate-900/30 border border-slate-800 border-dashed flex flex-col items-center justify-center p-8 text-center">
                            <Activity className="w-8 h-8 text-slate-700 mb-4" />
                            <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs">Historical Trends</h4>
                            <p className="text-slate-600 text-sm mt-2">Deep dive temporal analysis coming soon.</p>
                        </section>
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/20"
                        >
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 opacity-80">Global Coverage</h4>
                            <div className="text-4xl font-bold mb-2">1.2M+</div>
                            <p className="text-blue-100 text-xs">Daily sources analyzed across 40+ countries.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 bg-slate-900 border border-slate-800 rounded-3xl"
                        >
                            <h4 className="text-slate-200 font-bold text-sm mb-4">Sentiment Distribution</h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Positive", value: 65, color: "bg-emerald-500" },
                                    { label: "Neutral", value: 25, color: "bg-amber-500" },
                                    { label: "Negative", value: 10, color: "bg-rose-500" },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span className="text-white">{item.value}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={clsx("h-full rounded-full", item.color)}
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
