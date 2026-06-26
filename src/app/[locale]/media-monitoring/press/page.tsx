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

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr ? "رصد الصحافة والمطبوعات | المستكشف" : "Press & Publication Monitoring | ALMSTKSHF",
        description: isAr
            ? "رصد شامل للصحف والمجلات والبوابات الإخبارية الرقمية والمطبوعة."
            : "Comprehensive monitoring of newspapers, magazines, and digital news portals.",
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
    let initialReports = undefined;
    let initialSettings = undefined;
    let initialCrisisPlans = undefined;

    try {
        initialReports = await fetchQuery(api.queries.getMediaReports, { source: "Press Release" });
        initialSettings = await fetchQuery(api.settings.getSettings, {});
        initialCrisisPlans = await fetchQuery(api.queries.getCrisisPlans, {});
    } catch (err) {
        console.error("Error pre-fetching Press data on server:", err);
    }

    return (
        <PressClient 
            initialReports={initialReports}
            initialSettings={initialSettings}
            initialCrisisPlans={initialCrisisPlans}
        />
    );
}
