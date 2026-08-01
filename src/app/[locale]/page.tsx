/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import HeroSection from "@/components/HeroSection";
import HomeClient from "@/components/HomeClient";
import HomeSchema from "@/components/HomeSchema";
import { Metadata } from "next";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr
            ? "رصد إعلامي وتحليل مشاعر بالذكاء الاصطناعي | المستكشف"
            : "AI Media Monitoring & Sentiment Analysis Platform | ALMSTKSHF",
        description: isAr
            ? "المستكشف — المنصة الرائدة لرصد الإعلام وتحليل الرأي العام في الإمارات والسعودية. رصد فوري لأكثر من 3400 قناة تلفزيونية وإذاعية، تحليل المشاعر، إدارة الأزمات، وتقارير ذكية."
            : "ALMSTKSHF — The leading media monitoring and public opinion analysis platform in the UAE & Saudi Arabia. Real-time tracking of 3,400+ TV and radio channels, AI sentiment analysis, crisis management, and intelligent reporting.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}`,
            languages: {
                'ar': 'https://www.almstkshf.com/ar',
                'en': 'https://www.almstkshf.com/en',
                'x-default': 'https://www.almstkshf.com/ar',
            }
        },
    };
}

/**
 * Home page — Server Component.
 *
 * Architecture for fast LCP:
 * 1. `HeroSection` is a **Server Component** — renders the h1 (LCP element)
 *    as static HTML with no JS dependency. Browser paints it immediately.
 * 2. `HomeClient` is a **Client Component** — loaded as a separate JS chunk
 *    and handles all below-the-fold animated sections.
 *
 * This ensures the LCP element is never blocked behind a JS bundle download.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <main className="min-h-screen bg-background overflow-x-hidden">
            {/* JSON-LD structured data for media tracking, sentiment diagnostics,
                and automated media analysis — rendered server-side for crawlers */}
            <HomeSchema locale={locale} />

            {/* Server-rendered hero — LCP element paints here */}
            <HeroSection />

            {/* Client-side animated sections — below the fold */}
            <HomeClient />
        </main>
    );
}
