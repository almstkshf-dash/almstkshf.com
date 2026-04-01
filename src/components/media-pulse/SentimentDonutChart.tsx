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

export default function SentimentDonutChart({ data, nssIndex }: SentimentDonutChartProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const chartData = [
        { name: t("ToneLabels.positive"), value: data.positive, color: "var(--status-success)" },
        { name: t("ToneLabels.neutral"), value: data.neutral, color: "var(--status-warning)" },
        { name: t("ToneLabels.negative"), value: data.negative, color: "var(--status-error)" },
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
                            <Cell key={`cell-${index}`} fill={`hsl(${entry.color})`} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
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
