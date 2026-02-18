"use client";

import Container from "@/components/ui/Container";
import { Header } from "./media-pulse/Header";
import { DashboardGrid } from "./media-pulse/DashboardGrid";
import { DetailedContent } from "./media-pulse/DetailedContent";
import { AnalyticsStrategy } from "./media-pulse/AnalyticsStrategy";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function MediaPulseClient() {
    const articles = useQuery(api.monitoring.getArticles, { limit: 50 }) || [];
    const analytics = useQuery(api.monitoring.getAnalyticsOverview, {}) || {
        nss: 0,
        riskScore: 0,
        velocity: 0,
        totalReach: 0,
        sentimentDistribution: { Positive: 0, Neutral: 0, Negative: 0 },
        crisisProbability: 0,
    };

    const emotions = useQuery(api.monitoring.getEmotionAggregates, {}) || {};
    const geography = useQuery(api.monitoring.getGeographyAggregates, {}) || {};

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background transition-colors">
            <Container>
                <Header />
                <DashboardGrid
                    articles={articles}
                    analytics={{ ...analytics, emotions, geography }}
                />
                <div className="mt-32 space-y-32">
                    <DetailedContent />
                    <AnalyticsStrategy />
                </div>
            </Container>
        </main>
    );
}
