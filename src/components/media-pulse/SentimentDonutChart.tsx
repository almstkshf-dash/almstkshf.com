"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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

export default function SentimentDonutChart({ data, nssIndex }: SentimentDonutChartProps) {
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
        // so we must wrap them with hsl(). Popover/border are hex — use directly.
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

    const chartData = [
        { name: t("ToneLabels.positive"), value: data.positive, color: colors.success },
        { name: t("ToneLabels.neutral"), value: data.neutral, color: colors.warning },
        { name: t("ToneLabels.negative"), value: data.negative, color: colors.error },
    ];

    if (!mounted) return <div className="w-full h-[180px]" />;

    return (
        <div className="relative w-full h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
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

            {/* NSS Index Overlay */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
                <div className="text-2xl font-bold">{nssIndex}%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {t("nss_index")}
                </div>
            </div>
        </div>
    );
}
