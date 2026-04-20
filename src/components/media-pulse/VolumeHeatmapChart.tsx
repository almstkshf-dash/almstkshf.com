/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useTranslations } from "next-intl";
import { useMemo, memo } from "react";
import clsx from "clsx";

interface VolumeHeatmapChartProps {
    data: {
        hour: number;
        day: number;
        value: number;
    }[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const VolumeHeatmapChart = memo(function VolumeHeatmapChart({ data }: VolumeHeatmapChartProps) {
    const t = useTranslations("MediaPulseDetail.dashboard_grid");
    
    const DAYS = useMemo(() => [
        t("days.Sun", { defaultValue: "Sun" }),
        t("days.Mon", { defaultValue: "Mon" }),
        t("days.Tue", { defaultValue: "Tue" }),
        t("days.Wed", { defaultValue: "Wed" }),
        t("days.Thu", { defaultValue: "Thu" }),
        t("days.Fri", { defaultValue: "Fri" }),
        t("days.Sat", { defaultValue: "Sat" }),
    ], [t]);

    // Find absolute maximum to calculate relative intensity
    const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

    // Fast lookup for values
    const dataMap = useMemo(() => {
        const map: Record<string, number> = {};
        data.forEach(d => {
            map[`${d.day}-${d.hour}`] = d.value;
        });
        return map;
    }, [data]);

    // Helper to format hour beautifully
    const formatHour = (hour: number) => {
        if (hour === 0) return "12 AM";
        if (hour === 12) return "12 PM";
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    };

    return (
        <div className="w-full h-full flex flex-col pt-4 pb-2">
            <div className="flex flex-1 gap-2 sm:gap-4 overflow-x-auto pb-6 custom-scrollbar">
                {/* Y-Axis: Days */}
                <div className="flex flex-col gap-1.5 pt-6 justify-between select-none">
                    {DAYS.map(day => (
                        <div key={day} className="h-[22px] sm:h-[28px] flex items-center pr-2">
                            <span className="text-[10px] sm:text-xs font-bold text-foreground/70 uppercase tracking-widest">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Grid container */}
                <div className="flex-1 min-w-[600px] flex flex-col">
                    {/* Activity Grid */}
                    <div className="flex flex-col gap-1.5">
                        {DAYS.map((_, dayIndex) => (
                            <div key={dayIndex} className="flex gap-1.5 justify-between">
                                {HOURS.map((hour) => {
                                    const val = dataMap[`${dayIndex}-${hour}`] || 0;
                                    const intensity = val / maxVal;

                                    // Determine styling based on intensity
                                    let bgClass = "bg-muted/40";
                                    let shadowClass = "";
                                    let ringClass = "";
                                    let textClass = "text-blue-800 dark:text-blue-300";

                                    if (val > 0) {
                                        if (intensity > 0.8) {
                                            bgClass = "bg-rose-500 dark:bg-rose-600";
                                            shadowClass = "hover:shadow-rose-500/40";
                                            ringClass = "hover:ring-rose-500";
                                            textClass = "text-rose-500 dark:text-rose-400";
                                        }
                                        else if (intensity > 0.6) {
                                            bgClass = "bg-orange-500 dark:bg-orange-600";
                                            shadowClass = "hover:shadow-orange-500/40";
                                            ringClass = "hover:ring-orange-500";
                                            textClass = "text-orange-500 dark:text-orange-400";
                                        }
                                        else if (intensity > 0.4) {
                                            bgClass = "bg-amber-400 dark:bg-amber-500";
                                            shadowClass = "hover:shadow-amber-400/40";
                                            ringClass = "hover:ring-amber-400";
                                            textClass = "text-amber-500 dark:text-amber-400";
                                        }
                                        else if (intensity > 0.2) {
                                            bgClass = "bg-emerald-400 dark:bg-emerald-500";
                                            shadowClass = "hover:shadow-emerald-400/40";
                                            ringClass = "hover:ring-emerald-400";
                                            textClass = "text-emerald-500 dark:text-emerald-400";
                                        }
                                        else {
                                            bgClass = "bg-cyan-400 dark:bg-cyan-500";
                                            shadowClass = "hover:shadow-cyan-400/40";
                                            ringClass = "hover:ring-cyan-400";
                                            textClass = "text-cyan-500 dark:text-cyan-400";
                                        }
                                    }

                                    return (
                                        <div
                                            key={`${dayIndex}-${hour}`}
                                            className="group relative flex-1 aspect-square max-h-[28px]"
                                            role="gridcell"
                                            aria-label={t("heatmap_cell_label", {
                                                day: DAYS[dayIndex],
                                                time: formatHour(hour),
                                                count: val,
                                                defaultValue: `${val} articles on ${DAYS[dayIndex]} at ${formatHour(hour)}`
                                            })}
                                        >
                                            <div
                                                className={clsx(
                                                    "w-full h-full rounded sm:rounded-md transition-all duration-300",
                                                    "border border-border/50",
                                                    "hover:scale-125 hover:z-10 hover:shadow-lg cursor-crosshair",
                                                    bgClass,
                                                    shadowClass,
                                                    val === 0 && "hover:border-foreground/30",
                                                    val > 0 && clsx("hover:ring-2 hover:border-transparent cursor-pointer", ringClass)
                                                )}
                                            />
                                            {/* Custom floating tooltip for higher fidelity (desktop only) */}
                                            {val > 0 && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 bg-popover border border-border text-popover-foreground text-[10px] sm:text-xs py-1.5 px-3 rounded-lg shadow-xl shadow-black/10 pointer-events-none transition-all duration-300 z-50">
                                                    <div className="font-bold mb-0.5 text-foreground/70">{DAYS[dayIndex]} {t("at", { defaultValue: "at" })} {formatHour(hour)}</div>
                                                    <div className={clsx("font-black text-sm flex items-center gap-1", textClass)}>
                                                        {val} <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{t("articles_count", { defaultValue: "articles" })}</span>
                                                    </div>
                                                    {/* Triangle pointer */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* X-Axis: Hours Label */}
                    <div className="flex justify-between mt-2 pl-0 select-none">
                        {HOURS.map((hour) => (
                            <div key={hour} className="flex-1 flex justify-center">
                                {/* Only show every 2 hours to avoid crowding */}
                                {hour % 2 === 0 && (
                                    <span className="text-[9px] sm:text-[10px] font-bold text-foreground/60 whitespace-nowrap -rotate-45 sm:rotate-0 translate-y-2 sm:translate-y-0">
                                        {formatHour(hour)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend Component */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-4">
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">{t('Less', { defaultValue: 'Less' })}</span>
                <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-sm bg-muted/40 border border-border/50" />
                    <div className="w-4 h-4 rounded-sm bg-cyan-400 dark:bg-cyan-500 border border-border/50" />
                    <div className="w-4 h-4 rounded-sm bg-emerald-400 dark:bg-emerald-500 border border-border/50" />
                    <div className="w-4 h-4 rounded-sm bg-amber-400 dark:bg-amber-500 border border-border/50" />
                    <div className="w-4 h-4 rounded-sm bg-orange-500 dark:bg-orange-600 border border-border/50" />
                    <div className="w-4 h-4 rounded-sm bg-rose-500 dark:bg-rose-600 border border-border/50 shadow-sm shadow-rose-500/20" />
                </div>
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">{t('More', { defaultValue: 'More' })}</span>
            </div>
        </div>
    );
});

export default VolumeHeatmapChart;
