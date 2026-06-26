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
import CrisisManagementClient from "@/components/CrisisManagementClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr ? "إدارة أزمات السمعة | المستكشف" : "Crisis & Reputation Management | ALMSTKSHF",
        description: isAr
            ? "بنية تحتية متطورة لرصد الأزمات والتحكم بالسمعة الإعلامية في الوقت الفعلي."
            : "Advanced infrastructure for crisis monitoring and real-time reputational protection.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/crisis-management`,
            languages: {
                'x-default': 'https://www.almstkshf.com/media-monitoring/crisis-management',
                en: 'https://www.almstkshf.com/en/media-monitoring/crisis-management',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/crisis-management',
            }
        },
    };
}

export default async function CrisisManagementPage() {
    let initialReports = undefined;
    let initialSettings = undefined;
    let initialCrisisPlans = undefined;

    try {
        initialReports = await fetchQuery(api.queries.getMediaReports, { source: "All" });
        initialSettings = await fetchQuery(api.settings.getSettings, {});
        initialCrisisPlans = await fetchQuery(api.queries.getCrisisPlans, {});
    } catch (err) {
        console.error("Error pre-fetching CrisisManagement data on server:", err);
    }

    return (
        <div className="pt-24 min-h-screen bg-slate-950">
            <CrisisManagementClient 
                initialReports={initialReports}
                initialSettings={initialSettings}
                initialCrisisPlans={initialCrisisPlans}
            />
        </div>
    );
}
