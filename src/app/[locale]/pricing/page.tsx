/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PricingClient from '@/components/PricingClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "أسعار باقات الرصد الإعلامي — خطط مرنة للمؤسسات"
            : "Media Monitoring Pricing Plans — Flexible Packages for Enterprises",
        description: isAr
            ? "اختر باقة الرصد الإعلامي المناسبة لمؤسستك. خطط تبدأ من الباقة الأساسية حتى باقة المؤسسات مع رصد تلفزيوني وإذاعي وتحليل مشاعر بالذكاء الاصطناعي ودعم على مدار الساعة."
            : "Choose the right media monitoring package for your organization. Plans from Standard to Enterprise with TV and radio monitoring, AI sentiment analysis, and 24/7 dedicated support.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/pricing`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/pricing',
                en: 'https://www.almstkshf.com/en/pricing',
                ar: 'https://www.almstkshf.com/ar/pricing',
            }
        },
    };
}

export default async function PricingPage() {
    // TODO: Replace with new backend API calls when Railway backend is ready
    return <PricingClient />;
}

