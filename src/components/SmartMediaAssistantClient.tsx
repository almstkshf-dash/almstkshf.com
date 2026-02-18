"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { Mic2, Sparkles, MessageSquare, PenTool, Brain, Share2, Zap, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function SmartMediaAssistantClient() {
    const t = useTranslations("Navigation");
    const tWhy = useTranslations("WhyChooseUs");
    const tAi = useTranslations("AI");

    const [prompt, setPrompt] = React.useState("");
    const [response, setResponse] = React.useState("");
    const [isGenerating, setIsGenerating] = React.useState(false);

    const capabilities = [
        {
            title: tAi("capabilities.s1.title"),
            desc: tAi("capabilities.s1.desc"),
            icon: Mic2,
            color: "text-blue-400"
        },
        {
            title: tAi("capabilities.s2.title"),
            desc: tAi("capabilities.s2.desc"),
            icon: Share2,
            color: "text-purple-400"
        },
        {
            title: tAi("capabilities.s3.title"),
            desc: tAi("capabilities.s3.desc"),
            icon: Zap,
            color: "text-amber-400"
        }
    ];

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setResponse("");

        // Mock generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResponses = [
            "Based on recent media analysis, here is a suggested press response...",
            "Sentiment dip detected in energy sector. Recommended tactical response...",
            "Drafting official statement for executive review...",
            "Sentiment trend analyzed. Public perception shift identified."
        ];

        setResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)]);
        setIsGenerating(false);
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-950 text-white overflow-hidden">
            <Container>
                {/* Hero / AI Agent Intro */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <div className="flex-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold uppercase tracking-widest"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>{tAi("badge")}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent"
                        >
                            {tWhy("ai_agent.title")}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl"
                        >
                            {tWhy("ai_agent.desc")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={tAi("instruction")}
                                className="flex-1 px-6 py-4 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                            >
                                {isGenerating ? "..." : tAi("deploy")}
                            </button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 relative w-full max-w-xl"
                    >
                        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                        <div className="relative p-8 bg-slate-900/50 border border-indigo-500/30 rounded-[3rem] backdrop-blur-2xl shadow-2xl overflow-hidden">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">{tAi("status")}</p>
                                        <p className="text-white font-bold italic">{isGenerating ? "processing_input..." : tAi("instruction")}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <AnimatePresence mode="wait">
                                        {(prompt || response) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                                                    <p className="text-xs text-slate-500 mb-2">{tAi("prompt")}</p>
                                                    <p className="text-sm font-medium">{prompt || "..."}</p>
                                                </div>

                                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl min-h-[100px] flex flex-col justify-center">
                                                    <p className="text-xs text-indigo-400 mb-2">{tAi("response")}</p>
                                                    {isGenerating ? (
                                                        <div className="space-y-2">
                                                            <div className="h-2 bg-indigo-400/30 rounded-full w-full animate-pulse"></div>
                                                            <div className="h-2 bg-indigo-400/30 rounded-full w-5/6 animate-pulse" style={{ animationDelay: "200ms" }}></div>
                                                            <div className="h-2 bg-indigo-400/30 rounded-full w-4/6 animate-pulse" style={{ animationDelay: "400ms" }}></div>
                                                        </div>
                                                    ) : (
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-sm leading-relaxed"
                                                        >
                                                            {response || "Awaiting instruction..."}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Capabilities Grid */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold">{tAi("capabilities.title")}</h2>
                        <p className="text-slate-500 uppercase tracking-widest font-bold text-xs">{tAi("capabilities.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {capabilities.map((cap, idx) => (
                            <motion.div
                                key={cap.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-10 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group"
                            >
                                <div className={clsx("w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner")}>
                                    <cap.icon className={clsx("w-7 h-7", cap.color)} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{cap.title}</h3>
                                <p className="text-slate-400 font-light leading-relaxed">{cap.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Integration Section */}
                <section className="mt-40 bg-gradient-to-br from-indigo-900/20 to-transparent p-12 md:p-24 rounded-[4rem] border border-indigo-500/10 text-center space-y-8">
                    <Layout className="w-16 h-16 text-indigo-500 mx-auto" />
                    <h2 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto tracking-tight">{tAi("integration.title")}</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                        {tAi("integration.desc")}
                    </p>
                    <div className="flex justify-center flex-wrap gap-8 opacity-40">
                        <div className="font-black italic text-xl">WHATSAPP</div>
                        <div className="font-black italic text-xl">TEAMS</div>
                        <div className="font-black italic text-xl">SLACK</div>
                        <div className="font-black italic text-xl">OUTLOOK</div>
                    </div>
                </section>
            </Container>
        </main>
    );
}
