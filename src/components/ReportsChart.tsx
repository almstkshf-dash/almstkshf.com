"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ReportsChartPoint {
    timestamp?: number;
    publishedDate?: string;
}

interface ReportsChartProps {
    data: ReportsChartPoint[];
}

export default function ReportsChart({ data }: ReportsChartProps) {
    const t = useTranslations("MediaMonitoring.dashboard");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const parsePublishedDate = (publishedDate?: string) => {
        if (!publishedDate) return null;
        const [day, month, year] = publishedDate.split("/");
        if (!day || !month || !year) return null;

        const parsed = new Date(Number(year), Number(month) - 1, Number(day));
        if (Number.isNaN(parsed.getTime())) return null;

        return parsed;
    };

    // Process data to group by date
    const processedData = data?.reduce((acc: { date: string; count: number }[], report) => {
        const reportDate = typeof report.timestamp === "number"
            ? new Date(report.timestamp)
            : parsePublishedDate(report.publishedDate);

        if (!reportDate || Number.isNaN(reportDate.getTime())) {
            return acc;
        }

        const date = reportDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ date, count: 1 });
        }
        return acc;
    }, []) || [];

    // Sort by date (assuming rough chronological order or needing explicit sort)
    // For simplicity, we'll assume data comes or is mapped somewhat chronologically, 
    // or we could sort it here if needed.

    // Fill in missing days if needed? For now, let's just show active days.

    if (processedData.length === 0) {
        // Mock data for empty state to show the visual
        const mockData = [
            { date: 'Mon', count: 4 },
            { date: 'Tue', count: 3 },
            { date: 'Wed', count: 7 },
            { date: 'Thu', count: 5 },
            { date: 'Fri', count: 8 },
            { date: 'Sat', count: 2 },
            { date: 'Sun', count: 6 },
        ];

        if (!mounted) return <div className="w-full h-[300px] mb-8" />;

        return (
            <div className="w-full h-[300px] p-4 bg-card border border-border rounded-2xl mb-8 transition-opacity duration-300">
                <h3 className="text-lg font-bold mb-4 px-2">{t('reports_overview')} (Demo)</h3>
                <ResponsiveContainer width="100%" height="100%" minHeight={100} minWidth={100}>
                    <AreaChart data={mockData}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorCount)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (!mounted) return <div className="w-full h-[300px] mb-8" />;

    return (
        <div className="w-full h-[300px] p-4 bg-card border border-border rounded-2xl mb-8 transition-opacity duration-300">
            <h3 className="text-lg font-bold mb-4 px-2">{t('reports_overview')}</h3>
            <ResponsiveContainer width="100%" height="100%" minHeight={100} minWidth={100}>
                <AreaChart data={processedData}>
                    <defs>
                        <linearGradient id="colorCountReal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorCountReal)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
