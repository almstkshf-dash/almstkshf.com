/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { Mic2, Sparkles, MessageSquare, PenTool, Brain, Share2, Zap, Layout, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useAction } from "convex/react";
import Button from "./ui/Button";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function SmartMediaAssistantClient() {
    const t = useTranslations("Navigation");
    const tWhy = useTranslations("WhyChooseUs");
    const tAi = useTranslations("AI");

    const [prompt, setPrompt] = React.useState("");
    const [analysis, setAnalysis] = React.useState<any>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [retryCountdown, setRetryCountdown] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (retryCountdown === null) return;
        if (retryCountdown <= 0) {
            setRetryCountdown(null);
            return;
        }
        const timer = setInterval(() => {
            setRetryCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timer);
    }, [retryCountdown]);

    const analyzeAction = useAction(api.media.analyzeMedia);

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
        },
        {
            title: tAi("capabilities.s4.title"),
            desc: tAi("capabilities.s4.desc"),
            icon: Bot,
            color: "text-red-400"
        }
    ];

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setAnalysis(null);

        try {
            const result = await analyzeAction({ text: prompt });
            console.log("Analysis Result:", result);

            if (result && result.success && result.data) {
                const analysisData = result.data;
                // Backend already returns 0-100 values
                const mappedResult = {
                    ...analysisData,
                    score: Math.round(analysisData.score || 70),
                    riskScore: Math.round(analysisData.riskScore || 15)
                };
                setAnalysis(mappedResult);
                toast.success(tAi("analysis_complete"));
            } else if ((result as any)?.capacityExhausted) {
                const waitTime = (result as any).retryAfter || 60;
                setRetryCountdown(waitTime);
                toast.error(tAi("ai_busy_wait", { seconds: waitTime }));
            } else {
                toast.error(result?.error || tAi("analysis_empty"));
            }
        } catch (error) {
            console.error("AI Assistant Error:", error);
            toast.error(tAi("analysis_error"));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background text-foreground overflow-hidden">
            <Container>
                {/* Hero / AI Agent Intro */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32 relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -start-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
                    <div className="absolute -bottom-24 -end-24 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

                    <div className="flex-1 space-y-10 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 animate-pulse" aria-hidden="true" />
                            <span>{tAi("badge")}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] transition-colors"
                        >
                            <span className="block text-foreground">{tWhy("ai_agent.title").split(' ')[0]}</span>
                            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                                {tWhy("ai_agent.title").split(' ').slice(1).join(' ')}
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-foreground/70 font-light leading-relaxed max-w-2xl border-s-2 border-primary/20 ps-6"
                        >
                            {tWhy("ai_agent.desc")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 p-2 bg-card/50 backdrop-blur-xl border border-border rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                        >
                            <label htmlFor="ai-prompt" className="sr-only">{tAi("prompt")}</label>
                            <div className="flex-1 relative flex items-center">
                                <MessageSquare className="absolute start-4 w-5 h-5 text-primary/50" />
                                <input
                                    id="ai-prompt"
                                    name="ai-prompt"
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={tAi("instruction")}
                                    autoComplete="on"
                                    className="w-full ps-12 pe-4 py-4 bg-transparent border-none focus:ring-0 transition-all text-foreground text-lg placeholder:text-foreground/30 font-medium"
                                />
                            </div>
                            <Button
                                onClick={handleGenerate}
                                isLoading={isGenerating}
                                disabled={!prompt || retryCountdown !== null}
                                className="px-10 py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black transition-all shadow-lg shadow-primary/20 text-white whitespace-nowrap h-auto group"
                            >
                                {retryCountdown !== null ? `${retryCountdown}s` : (
                                    <span className="flex items-center gap-2">
                                        {tAi("deploy")}
                                        <Zap className="w-4 h-4 group-hover:fill-current transition-all" />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="flex-1 relative w-full max-w-xl group"
                    >
                        <div className="absolute inset-0 bg-primary/30 blur-[120px] rounded-full animate-pulse-slow group-hover:bg-primary/40 transition-colors" />
                        <div className="relative p-1 bg-gradient-to-br from-primary/30 via-border to-accent/30 rounded-[3.5rem] shadow-2xl">
                            <div className="relative bg-card/80 backdrop-blur-[40px] rounded-[3.25rem] p-10 overflow-hidden">
                                <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5 border-b border-border/50 pb-8">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                                            <Brain className="w-8 h-8 text-primary-foreground" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">{tAi("status")}</p>
                                            <p className="text-xl font-bold italic tracking-tight">{isGenerating ? tAi("processing_input") : tAi("instruction")}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <AnimatePresence mode="wait">
                                            {(prompt || analysis) ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="p-5 bg-background/40 backdrop-blur-md border border-border/50 rounded-[2rem] shadow-inner">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-3">{tAi("prompt")}</p>
                                                        <p className="text-base font-medium leading-relaxed">{prompt || "..."}</p>
                                                    </div>

                                                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] min-h-[160px] flex flex-col relative overflow-hidden group/res">
                                                        <div className="absolute top-0 end-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -z-10 group-hover/res:bg-primary/20 transition-colors" />
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">{tAi("response")}</p>
                                                        
                                                        {isGenerating ? (
                                                            <div className="space-y-3 pt-2">
                                                                <div className="h-2.5 bg-primary/20 rounded-full w-full animate-pulse" />
                                                                <div className="h-2.5 bg-primary/20 rounded-full w-[92%] animate-pulse" style={{ animationDelay: "200ms" }} />
                                                                <div className="h-2.5 bg-primary/20 rounded-full w-[85%] animate-pulse" style={{ animationDelay: "400ms" }} />
                                                                <div className="h-2.5 bg-primary/20 rounded-full w-[95%] animate-pulse" style={{ animationDelay: "600ms" }} />
                                                            </div>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="text-base space-y-6"
                                                            >
                                                                {analysis ? (
                                                                    <>
                                                                        <div className="flex flex-wrap gap-3">
                                                                            <span className={clsx(
                                                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm",
                                                                                analysis.risk === "High" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                                                                    analysis.risk === "Medium" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                                                        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                                            )}>
                                                                                {tAi("risk_label")}: {analysis.risk}
                                                                            </span>
                                                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                                                {tAi("sentiment_label")}: {analysis.sentiment}
                                                                            </span>
                                                                        </div>
                                                                        <div className="relative">
                                                                            <div className="absolute start-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                                                                            <p className="leading-relaxed ps-5 italic text-foreground font-medium text-lg">
                                                                                {analysis.recommendation}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center py-4 opacity-40">
                                                                        <Sparkles className="w-8 h-8 mb-3 animate-pulse" />
                                                                        <p className="text-sm font-medium">{tAi("awaiting_instruction")}</p>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 opacity-20 border-2 border-dashed border-border rounded-[2rem]">
                                                    <Bot className="w-16 h-16 mb-4" />
                                                    <p className="font-bold uppercase tracking-widest text-xs">Ready for input</p>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Capabilities Grid */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold">{tAi("capabilities.title")}</h2>
                        <p className="text-primary uppercase tracking-widest font-bold text-xs">{tAi("capabilities.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {capabilities.map((cap, idx) => (
                            <motion.div
                                key={cap.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-10 bg-card border border-border rounded-[2.5rem] hover:border-primary/30 transition-all group shadow-sm hover:shadow-xl"
                            >
                                <div className={clsx("w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner")}>
                                    <cap.icon className={clsx("w-7 h-7", cap.color)} aria-hidden="true" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{cap.title}</h3>
                                <p className="text-foreground/80 font-light leading-relaxed">{cap.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Integration Section */}
                <section className="mt-40 bg-gradient-to-br from-primary/10 to-transparent p-12 md:p-24 rounded-[4rem] border border-primary/10 text-center space-y-8">
                    <Layout className="w-16 h-16 text-primary mx-auto" aria-hidden="true" />
                    <h2 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto tracking-tight">{tAi("integration.title")}</h2>
                    <p className="text-foreground/80 text-lg max-w-2xl mx-auto font-light">
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
