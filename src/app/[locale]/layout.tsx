/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";
import { routing } from '@/i18n/config';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import Navbar from '@/components/Navbar';
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
 * noise.svg is used in the HeroSection above the fold. Without a preload hint,
 * the browser discovers it only when the CSS background rule is evaluated,
 * which introduces a waterfall delay that adds to Speed Index and LCP.
 */
ReactDOM.preload('/noise.svg', { as: 'image', fetchPriority: 'low' });
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
            default: isAr ? "المستكشف - حلول إعلامية وقانونية متقدمة" : "ALMSTKSHF - Advanced Media & Legal Solutions",
            template: `%s | ${isAr ? "المستكشف" : "ALMSTKSHF"}`
        },
        description: isAr
            ? "المستكشف هو شريكك الاستراتيجي للرصد الإعلامي الذكي والحلول القانونية المبنية على البيانات."
            : "ALMSTKSHF is your strategic partner for intelligent media monitoring and data-driven legal solutions.",
        keywords: ["AI", "Media Monitoring", "Legal Tech", "UAE", "Data Analysis", "Strategic Advisor", "Dubai", "Abu Dhabi"],
        openGraph: {
            type: "website",
            locale: locale === "ar" ? "ar_AE" : "en_US",
            url: `https://www.almstkshf.com/${locale}`,
            siteName: "ALMSTKSHF",
            images: [
                {
                    url: "/logo.png",
                    width: 1200,
                    height: 630,
                    alt: "ALMSTKSHF - Advanced Media & Legal Solutions",
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            site: "@almstkshf",
            creator: "@tameryounes",
            title: isAr ? "المستكشف - حلول إعلامية وقانونية" : "ALMSTKSHF - Media & Legal Solutions",
            description: isAr 
                ? "شريكك الاستراتيجي للرصد الإعلامي والتحليل الذكي." 
                : "Your strategic partner for intelligent media monitoring.",
            images: ["/logo.png"],
        },
        alternates: {
            languages: {
                'x-default': 'https://www.almstkshf.com',
                en: 'https://www.almstkshf.com/en',
                ar: 'https://www.almstkshf.com/ar',
            },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();
    const dir = locale === "ar" ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir} className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning><head><link rel="preconnect" href="https://clerk.com" /><link rel="preconnect" href="https://img.clerk.com" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />{process.env.NEXT_PUBLIC_CONVEX_URL && (<link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_CONVEX_URL).origin} />)}<script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==="dark"||(!t)){d.classList.add('dark');}else if(t==="light"){d.classList.remove('dark');}}catch(e){}})();` }} /><script dangerouslySetInnerHTML={{ __html: `(function(){var s=document.createElement('style');s.id='no-transition';s.textContent='*,*::before,*::after{transition:none!important}';document.head.appendChild(s);window.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(function(){requestAnimationFrame(function(){var el=document.getElementById('no-transition');if(el)el.remove();});});});})();` }} /></head><body className={`${cairo.variable} antialiased font-sans bg-background text-foreground`}><RootProviders locale={locale} messages={messages}><Navbar /><Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}>{children}</Suspense><LazyLayoutParts /><Analytics /><SpeedInsights /></RootProviders><script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify([
                    {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "@id": "https://www.almstkshf.com/#organization",
                        "name": "ALMSTKSHF",
                        "url": "https://www.almstkshf.com",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.almstkshf.com/logo.png",
                            "width": 1200,
                            "height": 630
                        },
                        "sameAs": [
                            "https://twitter.com/almstkshf",
                            "https://linkedin.com/company/almstkshf",
                            "https://facebook.com/almstkshf"
                        ],
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+971-58-59-52-035",
                            "contactType": "customer service",
                            "areaServed": ["AE", "SA"],
                            "availableLanguage": ["Arabic", "English"]
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "@id": "https://www.almstkshf.com/#website",
                        "url": "https://www.almstkshf.com",
                        "name": "ALMSTKSHF",
                        "publisher": { "@id": "https://www.almstkshf.com/#organization" },
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://www.almstkshf.com/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": "ALMSTKSHF Dubai",
                        "image": "https://www.almstkshf.com/logo.png",
                        "@id": "https://www.almstkshf.com/dubai",
                        "url": "https://www.almstkshf.com",
                        "telephone": "+971-58-59-52-035",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "One Central 9th Floor - Trade Center",
                            "addressLocality": "Dubai",
                            "addressCountry": "AE"
                        },
                        "geo": {
                            "@type": "GeoCoordinates",
                            "latitude": 25.2267,
                            "longitude": 55.2831
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": "Tamer Younes",
                        "jobTitle": "Founder",
                        "affiliation": { "@id": "https://www.almstkshf.com/#organization" },
                        "sameAs": [
                            "https://linkedin.com/in/tameryounes"
                        ]
                    }
                ])
            }}
        />
        </body>
        </html>
    );
}
