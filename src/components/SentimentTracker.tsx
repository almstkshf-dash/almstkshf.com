"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle, Zap } from "lucide-react";
import clsx from "clsx";
import { useTranslations } from "next-intl";

interface Article {
    title: string;
    sentiment: string;
    sourceType: string;
    reach: number;
    ave: number;
    content?: string;
    [key: string]: any;
}

interface SentimentTrackerProps {
    articles?: Article[];
}

// Derive real source analysis from actual data
function analyzeBySource(articles: Article[]) {
    const sourceMap: Record<string, { positive: number; neutral: number; negative: number; total: number; reach: number }> = {};

    articles.forEach(a => {
        const category = a.sourceType || 'Other';

        if (!sourceMap[category]) {
            sourceMap[category] = { positive: 0, neutral: 0, negative: 0, total: 0, reach: 0 };
        }

        sourceMap[category].total++;
        sourceMap[category].reach += a.reach || 0;
        if (a.sentiment === 'Positive') sourceMap[category].positive++;
        else if (a.sentiment === 'Negative') sourceMap[category].negative++;
        else sourceMap[category].neutral++;
    });

    return Object.entries(sourceMap).map(([source, data]) => {
        const positiveRatio = data.total > 0 ? data.positive / data.total : 0;
        const negativeRatio = data.total > 0 ? data.negative / data.total : 0;
        const score = Math.round((positiveRatio * 100 + ((data.total - data.positive - data.negative) / data.total) * 50));

        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (positiveRatio > 0.5) sentiment = 'positive';
        else if (negativeRatio > 0.4) sentiment = 'negative';

        const trend = Math.round((positiveRatio - negativeRatio) * 100);

        return { source, sentiment, score: Math.min(score, 100), trend, count: data.total, reach: data.reach };
    });
}

// Build AI recommendation from data
function buildRecommendation(articles: Article[]): string {
    if (articles.length === 0) return '';
    const neg = articles.filter(a => a.sentiment === 'Negative').length;
    const pos = articles.filter(a => a.sentiment === 'Positive').length;
    const negRatio = neg / articles.length;

    if (negRatio > 0.5) {
        return 'ai_rec_high_negative';
    } else if (negRatio > 0.3) {
        return 'ai_rec_moderate_negative';
    } else if (pos / articles.length > 0.6) {
        return 'ai_rec_positive_trend';
    }
    return 'ai_rec_default';
}

export default function SentimentTracker({ articles = [] }: SentimentTrackerProps) {
    const t = useTranslations('SentimentTracker');

    const hasData = articles.length > 0;
    const sourceAnalysis = analyzeBySource(articles);
    const recKey = buildRecommendation(articles);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    {t('title')}
                </h3>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={clsx(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            hasData ? "bg-emerald-400" : "bg-slate-500"
                        )}></span>
                        <span className={clsx(
                            "relative inline-flex rounded-full h-2 w-2",
                            hasData ? "bg-emerald-500" : "bg-muted-foreground/30"
                        )}></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        {hasData ? t('live') : t('awaiting_data')}
                    </span>
                </div>
            </div>

            {!hasData && (
                <div className="p-6 bg-muted/30 border border-border rounded-2xl text-center">
                    <Zap className="w-6 h-6 text-amber-500/50 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">{t('no_data_message')}</p>
                </div>
            )}

            {hasData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sourceAnalysis.map((data, idx) => (
                            <motion.div
                                key={data.source}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all hover:bg-muted/30 group shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-foreground font-semibold text-sm">{data.source}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            {t('source_analysis')} · {data.count} {t('articles')}
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        "p-2 rounded-lg",
                                        data.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400" :
                                            data.sentiment === "negative" ? "bg-rose-500/10 text-rose-400" :
                                                "bg-amber-500/10 text-amber-400"
                                    )}>
                                        {data.sentiment === "positive" ? <TrendingUp className="w-4 h-4" /> :
                                            data.sentiment === "negative" ? <TrendingDown className="w-4 h-4" /> :
                                                <Minus className="w-4 h-4" />}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-3xl font-bold text-foreground tracking-tighter">
                                            {data.score}%
                                        </span>
                                        <span className={clsx(
                                            "text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1",
                                            data.trend > 0 ? "bg-emerald-500/10 text-emerald-400" :
                                                data.trend < 0 ? "bg-rose-500/10 text-rose-400" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            {data.trend > 0 ? "+" : ""}{data.trend}% {t('shift')}
                                        </span>
                                    </div>

                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${data.score}%` }}
                                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                            className={clsx(
                                                "h-full rounded-full transition-all duration-1000",
                                                data.sentiment === "positive" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                    data.sentiment === "negative" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                                        "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                            )}
                                        />
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        {t('reach')}: {data.reach.toLocaleString()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI Recommendation */}
                    {recKey && (
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4 items-start shadow-sm">
                            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h5 className="text-amber-600 dark:text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">{t('ai_recommendation')}</h5>
                                <p className="text-amber-700 dark:text-amber-300/80 text-xs leading-relaxed">{t(recKey)}</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
