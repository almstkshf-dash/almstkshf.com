"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import SentimentTracker from "@/components/SentimentTracker";
import { Activity, ShieldAlert, ShieldCheck, Zap, BarChart3, TrendingUp, AlertCircle, Globe } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function MediaPulseClient() {
    const t = useTranslations("Navigation");
    const tWhy = useTranslations("WhyChooseUs");

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-950">
            <Container>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Pulse View */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <Activity className="w-64 h-64" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-white">Live Intelligence Stream</h2>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">Real-time</div>
                                        <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Global</div>
                                    </div>
                                </div>
                                <SentimentTracker />
                            </div>
                        </section>

                        {/* Reputation Defense Chart */}
                        <section className="p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900/50 to-slate-950 border border-slate-800 flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-6">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                                </div>
                                <h3 className="text-3xl font-bold text-white">Reputation Safeguard</h3>
                                <p className="text-slate-400 leading-relaxed font-light">
                                    Automatic detection of coordinated disinformation campaigns. Our AI identifies pattern anomalies that precede "fake news" spikes, allowing for immediate neutralization.
                                </p>
                                <div className="flex gap-4">
                                    <div className="px-4 py-2 bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-rose-500/20">Anti-Bot Protocol</div>
                                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20">Verification Engine</div>
                                </div>
                            </div>
                            <div className="w-full md:w-64 h-64 relative flex items-center justify-center">
                                <div className="absolute inset-0 border-[16px] border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-[16px] border-emerald-500 rounded-full border-t-transparent border-l-transparent rotate-[45deg]"></div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-white">99.8%</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Safety Score</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group"
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Globe className="w-32 h-32" />
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-6 opacity-80 italic">Intelligence Scope</h4>
                            <div className="text-6xl font-bold mb-4 tracking-tighter">1.2M+</div>
                            <p className="text-blue-100 text-sm font-light leading-relaxed">Daily deep-source analysis across 40+ high-impact jurisdictions.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-8 bg-slate-900 border border-slate-800 rounded-[2rem] space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-white font-bold text-sm tracking-wider">Tone Distribution</h4>
                                <BarChart3 className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="space-y-6">
                                {[
                                    { label: "Positive", value: 65, color: "bg-emerald-500", icon: ShieldCheck },
                                    { label: "Neutral", value: 25, color: "bg-blue-500", icon: Activity },
                                    { label: "Negative", value: 10, color: "bg-rose-500", icon: AlertCircle },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-500 flex items-center gap-2">
                                                <item.icon className="w-3 h-3" />
                                                {item.label}
                                            </span>
                                            <span className="text-white bg-slate-800 px-2 py-0.5 rounded-md">{item.value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.value}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={clsx("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", item.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="p-8 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 space-y-4">
                            <Zap className="w-6 h-6 text-blue-400" />
                            <h4 className="text-white font-bold text-sm">Automated Alerts</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Critical shifts in public perception trigger instant notifications to your leadership war room.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
