"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { Mic2, Sparkles, MessageSquare, PenTool, Brain, Share2, Zap, Layout } from "lucide-react";
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
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <div className="flex-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold uppercase tracking-widest"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>{tAi("badge")}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
                        >
                            {tWhy("ai_agent.title")}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl"
                        >
                            {tWhy("ai_agent.desc")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <label htmlFor="ai-prompt" className="sr-only">{tAi("prompt")}</label>
                            <input
                                id="ai-prompt"
                                name="ai-prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={tAi("instruction")}
                                autoComplete="on"
                                className="flex-1 px-6 py-4 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                            />
                            <Button
                                onClick={handleGenerate}
                                isLoading={isGenerating}
                                disabled={!prompt}
                                className="px-8 py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg shadow-primary/20 text-white whitespace-nowrap h-auto"
                            >
                                {tAi("deploy")}
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 relative w-full max-w-xl"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                        <div className="relative p-8 bg-card/50 border border-primary/30 rounded-[3rem] backdrop-blur-2xl shadow-2xl overflow-hidden">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary">{tAi("status")}</p>
                                        <p className="text-foreground font-bold italic">{isGenerating ? tAi("processing_input") : tAi("instruction")}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <AnimatePresence mode="wait">
                                        {(prompt || analysis) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                <div className="p-4 bg-background/50 border border-border rounded-2xl">
                                                    <p className="text-xs text-muted-foreground mb-2">{tAi("prompt")}</p>
                                                    <p className="text-sm font-medium">{prompt || "..."}</p>
                                                </div>

                                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl min-h-[100px] flex flex-col justify-center">
                                                    <p className="text-xs text-primary mb-2">{tAi("response")}</p>
                                                    {isGenerating ? (
                                                        <div className="space-y-2">
                                                            <div className="h-2 bg-primary/30 rounded-full w-full animate-pulse"></div>
                                                            <div className="h-2 bg-primary/30 rounded-full w-5/6 animate-pulse" style={{ animationDelay: "200ms" }}></div>
                                                            <div className="h-2 bg-primary/30 rounded-full w-4/6 animate-pulse" style={{ animationDelay: "400ms" }}></div>
                                                        </div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-sm space-y-4"
                                                        >
                                                            {analysis ? (
                                                                <>
                                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                                        <span className={clsx(
                                                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                                            analysis.risk === "High" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                                                                analysis.risk === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                                                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                        )}>
                                                                            {tAi("risk_label")}: {analysis.risk}
                                                                        </span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
                                                                            {tAi("sentiment_label")}: {analysis.sentiment}
                                                                        </span>
                                                                    </div>
                                                                    <p className="leading-relaxed border-l-2 border-primary/30 pl-3 italic text-foreground">
                                                                        {analysis.recommendation}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-muted-foreground italic">{tAi("awaiting_instruction")}</p>
                                                            )}
                                                        </motion.div>
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
                        <p className="text-primary uppercase tracking-widest font-bold text-xs">{tAi("capabilities.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                    <cap.icon className={clsx("w-7 h-7", cap.color)} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{cap.title}</h3>
                                <p className="text-muted-foreground font-light leading-relaxed">{cap.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Integration Section */}
                <section className="mt-40 bg-gradient-to-br from-primary/10 to-transparent p-12 md:p-24 rounded-[4rem] border border-primary/10 text-center space-y-8">
                    <Layout className="w-16 h-16 text-primary mx-auto" />
                    <h2 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto tracking-tight">{tAi("integration.title")}</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
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
