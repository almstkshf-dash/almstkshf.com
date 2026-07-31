/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import MediaPulseClient from "@/components/MediaPulseClient";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

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
    let initialArticles: any[] = [];
    try {
        const rawArticles = await prisma.mediaMonitoringArticle.findMany({
            take: 50,
            orderBy: { createdAt: "desc" }
        });
        initialArticles = rawArticles.map((a: any) => ({
            ...a,
            createdAt: Number(a.createdAt),
            status: "Published"
        }));
    } catch (e) {
        console.error("Server query error on MediaPulsePage:", e);
    }

    return (
        <MediaPulseClient
            initialArticles={initialArticles}
            initialAnalytics={{}}
            initialEmotions={{}}
            initialGeography={[]}
        />
    );
}

