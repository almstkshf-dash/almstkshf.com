/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo, memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMounted } from "@/hooks/useMounted";

import { ChartSkeleton } from "@/components/ui/Skeleton";

interface SentimentDonutChartProps {
    data: {
        positive: number;
        neutral: number;
        negative: number;
    };
    nssIndex: number;
}

function getCSSVar(name: string): string {
    if (typeof window === "undefined" || !document.documentElement) {
        return "";
    }
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const SentimentDonutChart = memo(function SentimentDonutChart({ data, nssIndex }: SentimentDonutChartProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const mounted = useMounted();
    const [colors, setColors] = useState({
        popover: "#FFFFFF",
        border: "#E2E8F0",
        popoverFg: "#020617",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
    });

    useEffect(() => {
        const root = document.documentElement;
        const readColors = () => ({
            popover: getComputedStyle(root).getPropertyValue("--popover").trim() || "#FFFFFF",
            border: getComputedStyle(root).getPropertyValue("--border").trim() || "#E2E8F0",
            popoverFg: getComputedStyle(root).getPropertyValue("--popover-foreground").trim() || "#020617",
            success: `hsl(${getCSSVar("--status-success") || "158 64% 52%"})`,
            warning: `hsl(${getCSSVar("--status-warning") || "38 92% 50%"})`,
            error: `hsl(${getCSSVar("--status-error") || "0 84% 60%"})`,
        });
        setColors(readColors());
    }, []);

    const chartData = useMemo(() => [
        { name: t("ToneLabels.positive"), value: data.positive, color: colors.success },
        { name: t("ToneLabels.neutral"), value: data.neutral, color: colors.warning },
        { name: t("ToneLabels.negative"), value: data.negative, color: colors.error },
    ], [
        data.positive,
        data.neutral,
        data.negative,
        colors.success,
        colors.warning,
        colors.error,
        t
    ]);

    const total = data.positive + data.neutral + data.negative;

    if (!mounted) return <ChartSkeleton className="w-full aspect-[4/3]" />;
    if (total === 0) return <ChartSkeleton className="w-full aspect-[4/3]" />;

    return (
        <div
            id="sentiment-donut-chart-container"
            className="relative w-full aspect-[4/3] flex items-center justify-center"
            role="img"
            aria-label={t("sentiment_distribution_label", {
                positive: data.positive,
                neutral: data.neutral,
                negative: data.negative
            })}
        >
            <ResponsiveContainer width="100%" height="100%" minWidth={10} debounce={100}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="75%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `${value}%`}
                        contentStyle={{
                            backgroundColor: colors.popover,
                            border: `1px solid ${colors.border}`,
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: colors.popoverFg,
                        }}
                        labelStyle={{ color: colors.popoverFg, fontWeight: 700 }}
                        itemStyle={{ color: colors.popoverFg, fontWeight: 600 }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* NSS Index Overlay */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
                <div className="text-2xl font-bold">{nssIndex}%</div>
                <div className="text-[10px] text-foreground/70 uppercase tracking-wider">
                    {t("nss_index")}
                </div>
            </div>
        </div>
    );
});

SentimentDonutChart.displayName = "SentimentDonutChart";

export default SentimentDonutChart;
