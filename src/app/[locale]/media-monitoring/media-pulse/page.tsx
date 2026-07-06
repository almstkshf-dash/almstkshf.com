/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import MediaPulseClient from "@/components/MediaPulseClient";
import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'MediaPulsePage' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/media-pulse`,
            languages: {
                'x-default': 'https://www.almstkshf.com/media-monitoring/media-pulse',
                en: 'https://www.almstkshf.com/en/media-monitoring/media-pulse',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/media-pulse',
            }
        },
    };
}

export default async function MediaPulsePage() {
    let initialArticles: any = [];
    let initialAnalytics: any = {};
    let initialEmotions: any = {};
    let initialGeography: any = [];

    try {
        const [articles, analytics, emotions, geography] = await Promise.all([
            fetchQuery(api.monitoring.getArticles, { limit: 50 }),
            fetchQuery(api.monitoring.getAnalyticsOverview, {}),
            fetchQuery(api.monitoring.getEmotionAggregates, {}),
            fetchQuery(api.monitoring.getGeographyAggregates, {})
        ]);
        initialArticles = articles ?? [];
        initialAnalytics = analytics ?? {};
        initialEmotions = emotions ?? {};
        initialGeography = geography ?? [];
    } catch (err) {
        console.error("Error pre-fetching MediaPulse data on server:", err);
        initialArticles = [];
        initialAnalytics = {};
        initialEmotions = {};
        initialGeography = [];
    }

    return (
        <MediaPulseClient
            initialArticles={initialArticles}
            initialAnalytics={initialAnalytics}
            initialEmotions={initialEmotions}
            initialGeography={initialGeography}
        />
    );
}
