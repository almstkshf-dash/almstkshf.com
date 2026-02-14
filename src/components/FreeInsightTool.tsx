"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldAlert, TrendingUp, ArrowRight, Info } from "lucide-react";
import Container from "./ui/Container";
import Button from "./ui/Button";
import Link from "next/link";
import clsx from "clsx";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function FreeInsightTool() {
    const t = useTranslations("FreeTool");
    const locale = useLocale();
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{
        sentiment: string;
        risk: string;
        score: number;
        tone: string;
        recommendation: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const analyzeMedia = useAction(api.media.analyzeMedia);

    const handleAnalyze = async () => {
        if (!input.trim()) return;

        setIsAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            const data = await analyzeMedia({ text: input });
            setResult({
                sentiment: data.sentiment.toLowerCase(),
                risk: data.risk.toLowerCase(),
                score: data.score,
                tone: data.tone,
                recommendation: data.recommendation
            });
        } catch (err: any) {
            console.error(err);
            const message = err?.data || err?.message || "Analysis failed. Please try again.";
            setError(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="py-24 relative overflow-hidden">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4 mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>Free Service</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">{t("title")}</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
                    </div>

                    <div className="bg-card/40 border border-border rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl shadow-2xl relative">
                        <div className="absolute top-0 right-10 -translate-y-1/2">
                            <div className="w-20 h-20 bg-primary/20 blur-3xl rounded-full"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <label htmlFor="media-analysis-input" className="sr-only">
                                    {t("placeholder")}
                                </label>
                                <textarea
                                    id="media-analysis-input"
                                    name="media-text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={t("placeholder")}
                                    className="w-full bg-background border border-border rounded-3xl p-6 md:p-8 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors min-h-[160px] resize-none text-lg"
                                />
                                <div className="absolute bottom-6 right-6 flex gap-2">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !input.trim()}
                                        variant="primary"
                                        size="lg"
                                        className="rounded-2xl shadow-xl shadow-primary/20"
                                        isLoading={isAnalyzing}
                                    >
                                        {isAnalyzing ? t("analyzing") : t("button")}
                                    </Button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border"
                                    >
                                        {/* Sentiment Card */}
                                        <div className="p-6 rounded-3xl bg-card/50 border border-border space-y-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("sentiment")}</p>
                                                <TrendingUp className={clsx(
                                                    "w-4 h-4",
                                                    result.sentiment.toLowerCase() === "positive" ? "text-emerald-600 dark:text-emerald-400" :
                                                        result.sentiment.toLowerCase() === "neutral" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                                )} />
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-bold text-foreground transition-colors">{result.score}%</span>
                                                <span className={clsx(
                                                    "text-sm font-medium mb-1 transition-colors",
                                                    result.sentiment.toLowerCase() === "positive" ? "text-emerald-600 dark:text-emerald-400" :
                                                        result.sentiment.toLowerCase() === "neutral" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                                )}>
                                                    {t(`sentiments.${result.sentiment.toLowerCase()}`)}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden transition-colors">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.score}%` }}
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        result.sentiment.toLowerCase() === "positive" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                                            result.sentiment.toLowerCase() === "neutral" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Risk Card */}
                                        <div className="p-6 rounded-3xl bg-card/50 border border-border space-y-4 transition-all duration-300">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("risk")}</p>
                                                <ShieldAlert className={clsx(
                                                    "w-4 h-4",
                                                    result.risk.toLowerCase() === "low" ? "text-emerald-600 dark:text-emerald-400" :
                                                        result.risk.toLowerCase() === "medium" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                                )} />
                                            </div>
                                            <p className={clsx(
                                                "text-xl font-bold uppercase tracking-tight transition-colors",
                                                result.risk.toLowerCase() === "low" ? "text-emerald-600 dark:text-emerald-400" :
                                                    result.risk.toLowerCase() === "medium" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {t(`risk_labels.${result.risk.toLowerCase()}`)}
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed italic transition-colors">
                                                {t(`risk_levels.${result.risk.toLowerCase()}`)}
                                            </p>
                                        </div>

                                        {/* Strategy Card */}
                                        <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-3 transition-all duration-300">
                                            <div className="flex items-center gap-2">
                                                <Info className="w-4 h-4 text-primary" />
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest">{t("recommendation")}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase font-bold">{result.tone}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80 leading-relaxed font-medium transition-colors">
                                                    {result.recommendation}
                                                </p>
                                            </div>
                                            <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase pt-2">
                                                Full Strategy <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
