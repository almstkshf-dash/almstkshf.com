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
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from "recharts";

import { ChartSkeleton } from "@/components/ui/Skeleton";

interface EmotionRadarChartProps {
    data: {
        subject: string;
        value: number;
        fullMark: number;
    }[];
}

const EmotionRadarChart = memo(function EmotionRadarChart({ data }: EmotionRadarChartProps) {
    const t = useTranslations("Dashboard.emotions");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const translatedData = useMemo(() => data.map((item) => ({
        ...item,
        subject: t(item.subject.toLowerCase()) || item.subject,
    })), [data, t]);

    if (!mounted) return <ChartSkeleton height="300px" />;

    return (
        <div className="w-full h-[300px] min-h-[300px]" style={{ minHeight: '300px' }}>
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" aspect={2} minHeight={300} minWidth={0} debounce={50}>
                    <RadarChart 
                        cx="50%" 
                        cy="50%" 
                        outerRadius="80%" 
                        data={translatedData}
                        role="img"
                        aria-label="Emotional intensity radar chart"
                    >
                        <PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 500 }}
                            tickLine={false}
                        />
                        <Radar
                            name="Emotion"
                            dataKey="value"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.4}
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
});

export default EmotionRadarChart;
