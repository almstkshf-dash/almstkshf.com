/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useEffect, useState, memo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

import { ChartSkeleton } from "@/components/ui/Skeleton";

interface ArticlesTrendChartProps {
    data: {
        date: string;
        count: number;
    }[];
}

const ArticlesTrendChart = memo(function ArticlesTrendChart({ data }: ArticlesTrendChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <ChartSkeleton height="160px" />;

    return (
        <div className="relative w-full h-[160px] min-h-[160px]" style={{ minHeight: '160px' }}>
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" minHeight={160} minWidth={0} debounce={50}>
                    <AreaChart 
                        data={data} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        role="img"
                        aria-label="Article volume trend chart over time"
                    >
                        <defs>
                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 500 }}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--popover)",
                                border: "1px solid var(--border)",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                color: "var(--popover-foreground)",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            labelStyle={{ color: "var(--popover-foreground)", fontWeight: 700 }}
                            itemStyle={{ color: "var(--popover-foreground)", fontWeight: 600 }}
                        />
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false} 
                            stroke="var(--border)" 
                            opacity={0.3}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#trendGradient)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
});

export default ArticlesTrendChart;
