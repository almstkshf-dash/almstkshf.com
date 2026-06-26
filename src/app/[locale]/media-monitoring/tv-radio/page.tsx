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
import TvRadioClient from "@/components/TvRadioClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr ? "رصد البث التلفزيوني والإذاعي | المستكشف" : "TV & Radio Broadcast Monitoring | ALMSTKSHF",
        description: isAr
            ? "تتبع ورصد فوري لأكثر من 3400 قناة بث تلفزيوني وإذاعي محلي وعالمي."
            : "Real-time tracking and monitoring of over 3,400 local and global TV and radio broadcast channels.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/tv-radio`,
            languages: {
                'x-default': 'https://www.almstkshf.com/media-monitoring/tv-radio',
                en: 'https://www.almstkshf.com/en/media-monitoring/tv-radio',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/tv-radio',
            }
        },
    };
}

export default async function TvRadioPage() {
    let initialReports = undefined;
    let initialSettings = undefined;
    let initialCrisisPlans = undefined;

    try {
        initialReports = await fetchQuery(api.queries.getMediaReports, { source: "All" });
        initialSettings = await fetchQuery(api.settings.getSettings, {});
        initialCrisisPlans = await fetchQuery(api.queries.getCrisisPlans, {});
    } catch (err) {
        console.error("Error pre-fetching TvRadio data on server:", err);
    }

    return (
        <TvRadioClient 
            initialReports={initialReports}
            initialSettings={initialSettings}
            initialCrisisPlans={initialCrisisPlans}
        />
    );
}
