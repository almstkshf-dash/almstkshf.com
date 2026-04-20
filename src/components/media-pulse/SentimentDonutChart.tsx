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

interface SentimentDonutChartProps {
    data: {
        positive: number;
        neutral: number;
        negative: number;
    };
    nssIndex: number;
}

function getCSSVar(name: string): string {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const SentimentDonutChart = memo(function SentimentDonutChart({ data, nssIndex }: SentimentDonutChartProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const [mounted, setMounted] = useState(false);
    const [colors, setColors] = useState({
        popover: "#FFFFFF",
        border: "#E2E8F0",
        popoverFg: "#020617",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
    });

    useEffect(() => {
        setMounted(true);
        // Status tokens are stored as bare HSL components (e.g. "158 64% 52%")
        // so we must wrap them with hsl(). Popover/border are hex â€” use directly.
        const successHSL = getCSSVar("--status-success");
        const warningHSL = getCSSVar("--status-warning");
        const errorHSL = getCSSVar("--status-error");
        setColors({
            popover: getCSSVar("--popover") || "#FFFFFF",
            border: getCSSVar("--border") || "#E2E8F0",
            popoverFg: getCSSVar("--popover-foreground") || "#020617",
            success: successHSL ? `hsl(${successHSL})` : "#10B981",
            warning: warningHSL ? `hsl(${warningHSL})` : "#F59E0B",
            error: errorHSL ? `hsl(${errorHSL})` : "#EF4444",
        });
    }, []);

    const chartData = useMemo(() => [
        { name: t("ToneLabels.positive"), value: data.positive, color: colors.success },
        { name: t("ToneLabels.neutral"), value: data.neutral, color: colors.warning },
        { name: t("ToneLabels.negative"), value: data.negative, color: colors.error },
    ], [data.positive, data.neutral, data.negative, colors, t]);

    if (!mounted) return <div className="w-full h-[300px]" />;

    return (
        <div className="relative w-full h-[300px]" style={{ minHeight: '300px' }}>
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" minHeight={300} debounce={50}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            role="img"
                            aria-label={t("sentiment_distribution_label", {
                                positive: data.positive,
                                neutral: data.neutral,
                                negative: data.negative
                            })}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: colors.popover,
                                border: `1px solid ${colors.border}`,
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: colors.popoverFg,
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}

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

export default SentimentDonutChart;
