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
        title: isAr ? "المستكشف | الحلول الإعلامية والقانونية المتقدمة" : "ALMSTKSHF | Advanced Media & Legal Solutions",
        description: isAr
            ? "الصفحة الرئيسية للمستكشف - رائد الحلول الاستراتيجية والتحليل الإعلامي والقانوني في الخليج."
            : "ALMSTKSHF Home - Leader in strategic solutions, media analysis, and legal tech in the Gulf.",
        alternates: {
            canonical: `https://almstkshf.com/${locale}`,
            languages: {
                'ar': 'https://almstkshf.com/ar',
                'en': 'https://almstkshf.com/en',
                'x-default': 'https://almstkshf.com/ar',
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
