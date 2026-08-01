/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import type { Metadata } from "next";
import Script from "next/script";
import { Cairo, Inter } from "next/font/google";
import "../globals.css";
import { routing, Locale } from '@/i18n/config';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import Navbar from '@/components/Navbar';
import CompanySchema from '@/components/CompanySchema';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import LazyLayoutParts from '@/components/LazyLayoutParts';
import { RootProviders } from '@/components/providers/RootProviders';
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import ReactDOM from 'react-dom';

/*
 * RENDER-BLOCKING CSS FIX — Resource Hints via ReactDOM.preload()
 *
 * ReactDOM.preload() is the React 18 / Next.js App Router API for injecting
 * <link rel="preload" fetchpriority="high"> tags into the server-rendered HTML.
 * These hints tell the browser to start fetching assets as early as possible —
 * before the page's JS executes or CSS is even parsed.
 *
 * logo.png is used globally in the Navbar above the fold on all pages. Without a preload hint,
 * the browser discovers it late, introducing a waterfall delay.
 */
ReactDOM.preload('/logo.png', { as: 'image', fetchPriority: 'high' });


// PRIMARY APP FONT CONFIGURATION
// To change the font globally, update this import and the weight array.
const cairo = Cairo({
    subsets: ["latin", "arabic"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-cairo",
    display: "swap",
    preload: true,
});

/**
 * Latin companion font — ensures Latin glyphs use a well-hinted,
 * optically-balanced typeface instead of falling back to system-ui.
 * This closes the perceived size gap between Arabic (Cairo) and Latin text.
 */
const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
    preload: false, // Cairo is primary; Inter loads after
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    width: "device-width",
    initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: {
            default: isAr
                ? "المستكشف — رصد إعلامي وتحليل مشاعر بالذكاء الاصطناعي في الإمارات والسعودية"
                : "ALMSTKSHF — AI Media Monitoring & Sentiment Analysis | UAE & Saudi Arabia",
            template: `%s | ${isAr ? "المستكشف - رصد إعلامي" : "ALMSTKSHF Media Monitoring"}`
        },
        description: isAr
            ? "منصة رصد إعلامي وتحليل مشاعر الرأي العام بالذكاء الاصطناعي في الإمارات والسعودية والخليج. تتبع البث التلفزيوني والإذاعي والصحافة الرقمية مع تقارير فورية وتنبيهات الأزمات."
            : "AI-powered media monitoring and sentiment analysis platform serving UAE, Saudi Arabia & the Gulf. Track TV, radio, print and digital press with real-time reports and crisis alerts.",
        keywords: [
            "رصد إعلامي", "تحليل مشاعر", "media monitoring UAE", "media monitoring Saudi Arabia",
            "sentiment analysis Arabic", "رصد الأخبار", "تحليل الإعلام", "crisis management",
            "إدارة الأزمات", "press monitoring Gulf", "رصد البث", "OSINT", "media intelligence",
            "AI media analysis", "رصد تلفزيوني", "رصد إذاعي", "Dubai", "Abu Dhabi",
            "مراقبة وسائل الإعلام", "brand reputation monitoring", "تحليل الرأي العام",
        ],
        openGraph: {
            type: "website",
            locale: locale === "ar" ? "ar_AE" : "en_US",
            url: `https://www.almstkshf.com/${locale}`,
            siteName: isAr ? "المستكشف" : "ALMSTKSHF",
            title: isAr
                ? "المستكشف — منصة رصد إعلامي وتحليل مشاعر الرأي العام"
                : "ALMSTKSHF — Media Monitoring & Sentiment Analysis Platform",
            description: isAr
                ? "رصد فوري لأكثر من 3400 قناة تلفزيونية وإذاعية مع تحليل مشاعر بالذكاء الاصطناعي في الإمارات والسعودية."
                : "Real-time monitoring of 3,400+ TV & radio channels with AI sentiment analysis across UAE and Saudi Arabia.",
            images: [
                {
                    url: "/logo.png",
                    width: 1200,
                    height: 630,
                    alt: isAr
                        ? "المستكشف — منصة رصد إعلامي وتحليل مشاعر في الإمارات والسعودية"
                        : "ALMSTKSHF — Media Monitoring & Sentiment Analysis Platform for UAE & Saudi Arabia",
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            site: "@almstkshf",
            creator: "@tameryounes",
            title: isAr
                ? "المستكشف — رصد إعلامي وتحليل مشاعر بالذكاء الاصطناعي"
                : "ALMSTKSHF — AI Media Monitoring & Sentiment Analysis",
            description: isAr
                ? "شريكك الاستراتيجي لرصد الإعلام وتحليل الرأي العام في الإمارات والسعودية والخليج."
                : "Your strategic partner for media monitoring and public opinion analysis across UAE, Saudi Arabia & the Gulf.",
            images: ["/logo.png"],
        },

        alternates: {
            canonical: `https://www.almstkshf.com/${locale}`,
            languages: {
                // Region-specific hreflang tags — UAE and Saudi Arabia priority markets
                'en-AE': 'https://www.almstkshf.com/en',
                'ar-AE': 'https://www.almstkshf.com/ar',
                'en-SA': 'https://www.almstkshf.com/en',
                'ar-SA': 'https://www.almstkshf.com/ar',
                // Fallback for users outside specified regions — defaults to Arabic
                'x-default': 'https://www.almstkshf.com/ar',
            }
        },
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.ico",
            apple: "/logo.png",
        },
        metadataBase: new URL('https://www.almstkshf.com'),
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function RootLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    // Validate that the incoming `locale` parameter is valid

    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();
    const dir = locale === "ar" ? "rtl" : "ltr";
    const fontClass = locale === "ar" ? cairo.variable : `${cairo.variable} ${inter.variable}`;

    return (
        <html lang={locale} dir={dir} className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                {/* Google tag (gtag.js) */}
                <Script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-C4QXHZG3CP"
                    strategy="afterInteractive"
                />
                <Script id="google-tag" strategy="afterInteractive">{`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-C4QXHZG3CP');
                `}</Script>

                {/* 1. Theme and Transition scripts at the absolute top of the head to prevent visual flicker */}
                <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==="dark"||(!t)){d.classList.add('dark');}else if(t==="light"){d.classList.remove('dark');}}catch(e){}})();` }} />
                <script dangerouslySetInnerHTML={{ __html: `(function(){var s=document.createElement('style');s.id='no-transition';s.textContent='*,*::before,*::after{transition:none!important}';document.head.appendChild(s);window.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(function(){requestAnimationFrame(function(){var el=document.getElementById('no-transition');if(el)el.remove();});});});})();` }} />

                {/* 2. Preconnect hints */}
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
                    <>
                        <link rel="preconnect" href="https://clerk.com" />
                        <link rel="preconnect" href="https://img.clerk.com" />
                    </>
                )}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {process.env.NEXT_PUBLIC_CONVEX_URL && (process.env.NEXT_PUBLIC_CONVEX_URL.startsWith("http://") || process.env.NEXT_PUBLIC_CONVEX_URL.startsWith("https://")) && (
                    <link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_CONVEX_URL).origin} />
                )}
            </head>
            <body className={`${fontClass} antialiased font-sans bg-background text-foreground`}>
                <RootProviders locale={locale} messages={messages}>
                    <Suspense fallback={<div className="h-16 w-full bg-background border-b border-border" />}>
                        <Navbar />
                    </Suspense>
                    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}>
                        {children}
                    </Suspense>
                    <LazyLayoutParts />
                    <Analytics />
                    <SpeedInsights />
                </RootProviders>
                <CompanySchema />
            </body>
        </html>
    );
}
