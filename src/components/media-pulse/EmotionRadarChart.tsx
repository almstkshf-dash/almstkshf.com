"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo } from "react";
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from "recharts";

interface EmotionRadarChartProps {
    data: {
        subject: string;
        value: number;
        fullMark: number;
    }[];
}

export default function EmotionRadarChart({ data }: EmotionRadarChartProps) {
    const t = useTranslations("Dashboard.emotions");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const translatedData = useMemo(() => data.map((item) => ({
        ...item,
        subject: t(item.subject.toLowerCase()) || item.subject,
    })), [data, t]);

    if (!mounted) return (
        <div className="w-full h-[300px] flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
    );

    return (
        <div className="w-full h-[300px]" style={{ minHeight: '300px' }}>
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" minHeight={300} debounce={50}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={translatedData}>
                    <PolarGrid stroke="currentColor" className="text-border" strokeOpacity={0.5} />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
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
}
