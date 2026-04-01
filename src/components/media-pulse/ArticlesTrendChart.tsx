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

export default function ArticlesTrendChart({ data }: ArticlesTrendChartProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-full h-[150px]" />;

    return (
        <div className="w-full h-[150px] p-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="articlesTrendColor" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="95%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                        dy={6}
                    />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#articlesTrendColor)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
