/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/../convex/_generated/api";
import PressClient from "@/components/PressClient";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'PressPage' });
    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/press`,
            languages: {
                'x-default': 'https://www.almstkshf.com/media-monitoring/press',
                en: 'https://www.almstkshf.com/en/media-monitoring/press',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/press',
            }
        },
    };
}

export default async function PressPage() {
    let initialReports: any = [];
    let initialSettings: any = {};
    let initialCrisisPlans: any = [];

    try {
        const [reports, settings, crisisPlans] = await Promise.all([
            fetchQuery(api.queries.getMediaReports, { source: "Press Release" }),
            fetchQuery(api.settings.getSettings, {}),
            fetchQuery(api.queries.getCrisisPlans, {})
        ]);
        initialReports = reports ?? [];
        initialSettings = settings ?? {};
        initialCrisisPlans = crisisPlans ?? [];
    } catch (err) {
        console.error("Error pre-fetching Press data on server:", err);
        initialReports = [];
        initialSettings = {};
        initialCrisisPlans = [];
    }

    return (
        <PressClient 
            initialReports={initialReports}
            initialSettings={initialSettings}
            initialCrisisPlans={initialCrisisPlans}
        />
    );
}
