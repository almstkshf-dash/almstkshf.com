"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface ArticlesTrendChartProps {
    data: {
        date: string;
        count: number;
    }[];
}

/** Safely read a CSS custom property from :root. */
function getCSSVar(name: string): string {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function ArticlesTrendChart({ data }: ArticlesTrendChartProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const [mounted, setMounted] = useState(false);
    const [colors, setColors] = useState({
        primary: "#2563EB",
        border: "#E2E8F0",
        mutedFg: "#374151",
        popover: "#FFFFFF",
        popoverFg: "#020617",
    });

    useEffect(() => {
        setMounted(true);
        setColors({
            primary: getCSSVar("--primary") || "#2563EB",
            border: getCSSVar("--border") || "#E2E8F0",
            mutedFg: getCSSVar("--muted-foreground") || "#374151",
            popover: getCSSVar("--popover") || "#FFFFFF",
            popoverFg: getCSSVar("--popover-foreground") || "#020617",
        });
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-[160px] flex items-end gap-1 px-2 pb-4 animate-pulse">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                        key={i}
                        className="bg-primary/20 rounded-t-sm flex-1"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="w-full h-[160px] -mx-1">
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={160} debounce={1}>
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="articlesTrendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={colors.border}
                        opacity={0.5}
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.mutedFg, fontSize: 9, fontWeight: 600 }}
                        dy={6}
                    />
                    <YAxis hide />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const entry = payload[0] as { value?: number };
                            const val = entry?.value ?? 0;
                            return (
                                <div style={{
                                    backgroundColor: colors.popover,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    color: colors.popoverFg,
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                    padding: "6px 12px",
                                }}>
                                    <p style={{ fontWeight: 700, marginBottom: 2 }}>{label}</p>
                                    <p style={{ color: colors.primary, fontWeight: 800 }}>
                                        {val} {t("articles_count")}
                                    </p>
                                </div>
                            );
                        }}
                        cursor={{ stroke: colors.primary, strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke={colors.primary}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#articlesTrendGrad)"
                        dot={false}
                        activeDot={{
                            r: 4,
                            fill: colors.primary,
                            stroke: colors.popover,
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            )}
        </div>
    );
}
