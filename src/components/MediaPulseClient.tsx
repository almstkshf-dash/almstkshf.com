/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import Container from "@/components/ui/Container";
import { Header } from "./media-pulse/Header";
import DashboardGrid from "./media-pulse/DashboardGrid";
import { DetailedContent } from "./media-pulse/DetailedContent";
import { AnalyticsStrategy } from "./media-pulse/AnalyticsStrategy";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function MediaPulseClient({
    initialArticles,
    initialAnalytics,
    initialEmotions,
    initialGeography,
}: {
    initialArticles?: any;
    initialAnalytics?: any;
    initialEmotions?: any;
    initialGeography?: any;
}) {
    const articlesResult = useQuery(api.monitoring.getArticles, { limit: 50 });
    const articles = articlesResult?.items || initialArticles?.items || [];
    const rawAnalytics = useQuery(api.monitoring.getAnalyticsOverview, {});
    const analytics = rawAnalytics || initialAnalytics || {
        nss: 0,
        riskScore: 0,
        velocity: 0,
        totalReach: 0,
        sentimentDistribution: { Positive: 0, Neutral: 0, Negative: 0 },
        crisisProbability: 0,
    };

    const emotions = useQuery(api.monitoring.getEmotionAggregates, {}) || initialEmotions || {};
    const geography = useQuery(api.monitoring.getGeographyAggregates, {}) || initialGeography || {};

    const isLoading = (articlesResult === undefined && !initialArticles) || 
                      (rawAnalytics === undefined && !initialAnalytics);

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background transition-colors">
            <Container>
                <Header />
                <DashboardGrid
                    articles={articles}
                    analytics={{ ...analytics, emotions, geography }}
                    isLoading={isLoading}
                />
                <div className="mt-32 space-y-32">
                    <DetailedContent />
                    <AnalyticsStrategy />
                </div>
            </Container>
        </main>
    );
}
