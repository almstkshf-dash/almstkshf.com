/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from "next";
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
    // TODO: Replace with new backend API calls when Railway backend is ready
    return (
        <PressClient 
            initialReports={[]}
            initialSettings={{}}
            initialCrisisPlans={[]}
        />
    );
}

