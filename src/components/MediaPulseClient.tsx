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
import dynamic from "next/dynamic";

const DetailedContent = dynamic(() => import("./media-pulse/DetailedContent").then(m => m.DetailedContent), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-3xl bg-muted/5 border border-border/20" />
});

const AnalyticsStrategy = dynamic(() => import("./media-pulse/AnalyticsStrategy").then(m => m.AnalyticsStrategy), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-3xl bg-muted/5 border border-border/20" />
});

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
    const articles = Array.isArray(initialArticles) ? initialArticles : (initialArticles?.items || []);
    const analytics = initialAnalytics && Object.keys(initialAnalytics).length > 0 ? initialAnalytics : {
        nss: 0,
        riskScore: 0,
        velocity: 0,
        totalReach: 0,
        sentimentDistribution: { Positive: 0, Neutral: 0, Negative: 0 },
        crisisProbability: 0,
    };

    const emotions = initialEmotions || {};
    const geography = initialGeography || {};

    const isLoading = false;


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
