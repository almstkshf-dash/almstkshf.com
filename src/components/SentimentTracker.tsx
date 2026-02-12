"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface SentimentData {
    source: string;
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    trend: number;
}

const mockSentimentData: SentimentData[] = [
    { source: "Twitter / X", sentiment: "positive", score: 78, trend: 12 },
    { source: "LinkedIn", sentiment: "neutral", score: 52, trend: -2 },
    { source: "Local News", sentiment: "negative", score: 32, trend: -15 },
    { source: "International Press", sentiment: "positive", score: 85, trend: 5 },
];

export default function SentimentTracker() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Live Pulse: Public Sentiment
                </h3>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockSentimentData.map((data, idx) => (
                    <motion.div
                        key={data.source}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all hover:bg-slate-800/50 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-slate-200 font-semibold text-sm">{data.source}</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Source Analysis</p>
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
                                <span className="text-3xl font-bold text-white tracking-tighter">
                                    {data.score}%
                                </span>
                                <span className={clsx(
                                    "text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1",
                                    data.trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                )}>
                                    {data.trend > 0 ? "+" : ""}{data.trend}% Shift
                                </span>
                            </div>

                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-4 items-start">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                    <h5 className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">AI Recommendation</h5>
                    <p className="text-blue-300/80 text-xs leading-relaxed">
                        Significant sentiment drop detected in Local News. Consider activating Crisis Plan #4 (Reputation Management) to mitigate impact before International Press catches up.
                    </p>
                </div>
            </div>
        </div>
    );
}
