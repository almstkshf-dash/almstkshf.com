"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { Scale, FileText, Search, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LexcuraLawyerPage() {
    const t = useTranslations("CaseStudies.lexcura");

    const features = [
        {
            title: t("feature_analysis"),
            desc: t("feature_analysis_desc"),
            icon: Search
        },
        {
            title: t("feature_drafting"),
            desc: t("feature_drafting_desc"),
            icon: FileText
        },
        {
            title: t("feature_insights"),
            desc: t("feature_insights_desc"),
            icon: Zap
        }
    ];

    return (
        <main className="min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl rounded-full opacity-50"></div>

                <Container>
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8 text-center lg:text-left rtl:lg:text-right">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold uppercase tracking-widest"
                            >
                                <Scale className="w-4 h-4" />
                                <span>AI Legal Engine</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl lg:text-7xl font-bold text-white tracking-tight"
                            >
                                {t("title")}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0"
                            >
                                {t("subtitle")}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                            >
                                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1">
                                    Request Demo
                                </button>
                                <button className="px-8 py-4 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                                    View Whitepaper
                                </button>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 w-full max-w-xl aspect-square relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse"></div>
                            <div className="relative h-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center justify-center p-12">
                                <Scale className="w-1/2 h-1/2 text-blue-400 opacity-20 absolute" />
                                <div className="space-y-6 w-full">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                                                <div className="h-2 w-1/2 bg-slate-800/50 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-slate-950">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-all hover:border-blue-500/50 group"
                            >
                                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Security Section */}
            <section className="py-20 border-t border-slate-900">
                <Container>
                    <div className="bg-gradient-to-r from-blue-900/20 to-slate-900/40 border border-slate-800 p-12 rounded-3xl flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-shrink-0 w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-12 h-12 text-blue-400" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-white">Enterprise-Grade Security</h2>
                            <p className="text-slate-400 max-w-2xl">
                                Lexcura runs on a highly secure, private infrastructure ensuring your case data never leaves
                                your jurisdiction. Data is encrypted end-to-end and never used for retraining public models.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}
