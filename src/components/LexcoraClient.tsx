"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Container from "@/components/ui/Container";
import {
    Scale,
    ShieldCheck,
    Users,
    Zap,
    CheckCircle2,
    MessageSquare,
    Briefcase,
    Globe,
    ExternalLink,
    TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

export default function LexcoraClient() {
    const t = useTranslations("CaseStudies.lexcora");
    const locale = useLocale();

    const categories = [
        {
            id: "productivity",
            icon: Briefcase,
            items: ["case_files", "deadlines", "vault"]
        },
        {
            id: "client",
            icon: Users,
            items: ["portal", "transparency", "booking"]
        },
        {
            id: "governance",
            icon: ShieldCheck,
            items: ["approvals", "audit", "security"]
        },
        {
            id: "intelligence",
            icon: Zap,
            items: ["assistant", "ui"]
        },
        {
            id: "integrations",
            icon: Globe,
            items: ["comm", "workspace"]
        }
    ];

    return (
        <main className="min-h-screen pb-20 bg-slate-950 text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl rounded-full opacity-30 pointer-events-none"></div>

                <Container className="relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8 text-center lg:text-left rtl:lg:text-right">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold uppercase tracking-widest"
                            >
                                <Scale className="w-4 h-4" />
                                <span>{t("badge_erp")}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl lg:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                            >
                                {t("title")}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                            >
                                {t("subtitle")}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                            >
                                <Link
                                    href="https://lexcora-mbh.com"
                                    target="_blank"
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 hover:-translate-y-1 flex items-center gap-2"
                                >
                                    {t("cta_visit")}
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="px-8 py-4 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold hover:bg-slate-800 transition-all outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center"
                                >
                                    {t("cta_demo")}
                                </Link>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 w-full max-w-xl relative rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl group shadow-2xl shadow-blue-900/20"
                        >
                            <Image
                                src="/lexcora_dashboard.png"
                                alt="LexCora Digital Transformation Dashboard"
                                width={1920}
                                height={1080}
                                className="w-full h-auto rounded-3xl transition-transform duration-700"
                                priority
                                unoptimized
                            />
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Detailed Features */}
            <section className="py-24">
                <Container>
                    <div className="space-y-32">
                        {categories.map((cat, catIdx) => (
                            <div key={cat.id} className="space-y-12">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-900 pb-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-blue-500 font-bold uppercase tracking-[0.2em] text-sm">
                                            <cat.icon className="w-5 h-5" />
                                            <span>{t(`sections.${cat.id}.title`)}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-bold">{t(`sections.${cat.id}.subtitle`)}</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {cat.items.map((item, itemIdx) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: itemIdx * 0.1 }}
                                            className="group p-8 bg-slate-900/30 border border-slate-800 rounded-3xl hover:bg-slate-900/50 transition-all hover:border-blue-500/30"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <button className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-blue-400 transition-colors">
                                                        {t("cta_pricing")}
                                                    </button>
                                                    <button className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-blue-400 transition-colors">
                                                        {t("cta_case_studies")}
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                                                {t(`sections.${cat.id}.items.${item}.title`)}
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {t(`sections.${cat.id}.items.${item}.desc`)}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Expert Insights (FAQ) */}
            <section id="faq" className="py-24 bg-slate-900/20">
                <Container>
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold">{t("faq.title")}</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                            {t("faq.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {["what_is", "deadlines", "database", "customization", "financials", "permissions"].map((key, idx) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] hover:bg-slate-900 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <MessageSquare className="w-32 h-32" />
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 font-bold text-sm">
                                            0{idx + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {t(`faq.items.${key}.q`)}
                                        </h3>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed font-light">
                                        {t(`faq.items.${key}.a`)}
                                    </p>

                                    {/* Visual "Sign/Chart" placeholders per item */}
                                    <div className="pt-4 border-t border-slate-800/50">
                                        {key === "deadlines" && (
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={clsx("h-1 flex-1 rounded-full", i < 4 ? "bg-blue-500" : "bg-slate-800")}></div>
                                                ))}
                                            </div>
                                        )}
                                        {key === "permissions" && (
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800"></div>
                                                ))}
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[8px] font-bold">+5</div>
                                            </div>
                                        )}
                                        {key === "customization" && (
                                            <div className="flex gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                                <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                                                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                                            </div>
                                        )}
                                        {key === "financials" && (
                                            <div className="h-4 w-full bg-slate-800 rounded overflow-hidden">
                                                <div className="h-full bg-emerald-500/50 w-2/3"></div>
                                            </div>
                                        )}
                                        {(key === "what_is" || key === "database") && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                <TrendingUp className="w-3 h-3" />
                                                Optimized System
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Trusted By */}
            <section className="py-24 border-t border-slate-900 bg-slate-950">
                <Container>
                    <div className="text-center space-y-12">
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">{t("trusted")}</h2>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            {/* Placeholder Logos */}
                            <div className="text-2xl font-black italic">LAW FIRM ALPHA</div>
                            <div className="text-2xl font-black italic">GLOBAL LEGAL CO</div>
                            <div className="text-2xl font-black italic">EMIRATES COUNSEL</div>
                            <div className="text-2xl font-black italic">ZED & ASSOCIATES</div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA Final */}
            <section className="py-24">
                <Container>
                    <div className="relative rounded-[3rem] overflow-hidden bg-blue-600 p-12 md:p-24 text-center space-y-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
                        <h2 className="text-4xl md:text-6xl font-bold relative z-10">{t("cta_ready")}</h2>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto relative z-10">
                            {t("cta_join")}
                        </p>
                        <div className="flex justify-center flex-wrap gap-4 relative z-10">
                            <Link
                                href="https://lexcora-mbh.com"
                                className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold hover:scale-105 transition-transform"
                            >
                                {t("cta_start")}
                            </Link>
                            <Link
                                href={`/${locale}/contact`}
                                className="px-10 py-5 bg-blue-700 text-white border border-blue-500 rounded-2xl font-bold hover:scale-105 transition-transform"
                            >
                                {t("cta_demo")}
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}
