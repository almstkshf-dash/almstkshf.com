/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import CentralMediaRepositoryClient from "@/components/CentralMediaRepositoryClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr ? "مستودع الوسائط المركزي | المستكشف" : "Central Media Repository | ALMSTKSHF",
        description: isAr
            ? "مستودع مركزي للأصول الرقمية وإدارة وتحليل الملفات الإعلامية للمؤسسات الكبرى."
            : "Central repository for digital assets, managing and analyzing media files for enterprise organizations.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/central-media-repository`,
            languages: {
                'x-default': 'https://www.almstkshf.com/media-monitoring/central-media-repository',
                en: 'https://www.almstkshf.com/en/media-monitoring/central-media-repository',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/central-media-repository',
            }
        },
    };
}

export default function CentralMediaRepositoryPage() {
    return <CentralMediaRepositoryClient />;
}
