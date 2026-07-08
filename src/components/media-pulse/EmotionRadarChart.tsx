/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useTranslations } from "next-intl";
import { useMemo, memo, forwardRef } from "react";
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

const TICK_STYLE = { fill: "var(--foreground)", fontSize: 10, fontWeight: 500 };
const INITIAL_DIMENSION = { width: 10, height: 300 };

const EmotionRadarChart = memo(
    forwardRef<HTMLDivElement, EmotionRadarChartProps>(
        function EmotionRadarChart({ data }, ref) {
            const t = useTranslations("FreeTool.emotions");

            const translatedData = useMemo(() => data.map((item) => {
                const label = t(item.subject.toLowerCase()) || item.subject;
                return {
                    ...item,
                    subject: label,
                };
            }), [data, t]);

            return (
                <div ref={ref} className="relative w-full aspect-[4/3] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={10} debounce={100} initialDimension={INITIAL_DIMENSION}>
                        <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={translatedData}
                            role="img"
                            aria-label={t("accessibility_label", { defaultValue: "Emotional intensity radar chart" })}
                        >
                            <PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={TICK_STYLE}
                                tickLine={false}
                            />
                            <Radar
                                name={t("radar_name", { defaultValue: "Emotion" })}
                                dataKey="value"
                                stroke="var(--primary)"
                                fill="var(--primary)"
                                fillOpacity={0.4}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            );
        }
    )
);

export default EmotionRadarChart;
