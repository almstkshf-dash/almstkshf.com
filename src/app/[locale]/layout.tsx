import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { routing } from '@/i18n/config';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next";
import LazyLayoutParts from '@/components/LazyLayoutParts';
import { RootProviders } from '@/components/providers/RootProviders';

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


const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    preload: true,  // Ensure font is in the earliest request
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    weight: ["400", "700"],
    variable: "--font-ibm-plex-arabic",
    display: "swap",
    preload: false, // Fix: Prevent "preloaded but not used" warning on English locale
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

    // Preconnect hints for critical third-party origins are defined here so
    // Next.js injects them as early as possible in the <head>.

    return {
        title: {
            default: isAr ? "المستكشف - حلول إعلامية وقانونية متقدمة" : "ALMSTKSHF - Advanced Media & Legal Solutions",
            template: `%s | ${isAr ? "المستكشف" : "ALMSTKSHF"}`
        },
        description: isAr
            ? "المستكشف هو شريكك الاستراتيجي للرصد الإعلامي الذكي والحلول القانونية المبنية على البيانات."
            : "ALMSTKSHF is your strategic partner for intelligent media monitoring and data-driven legal solutions.",
        keywords: ["AI", "Media Monitoring", "Legal Tech", "UAE", "Data Analysis", "Strategic Advisor"],
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
                    alt: "ALMSTKSHF",
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "ALMSTKSHF",
            description: "Advanced Media & Legal Solutions",
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
        <html lang={locale} dir={dir} className="scroll-smooth" suppressHydrationWarning>


            <head>
                {/*
                      Preconnect to critical third-party origins.
                      This eliminates DNS + TCP + TLS setup time for these domains
                      which was adding ~200-400ms to LCP on the first request.
                    */}
                <link rel="preconnect" href="https://clerk.com" />
                <link rel="preconnect" href="https://img.clerk.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {process.env.NEXT_PUBLIC_CONVEX_URL && (
                    <link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_CONVEX_URL).origin} />
                )}



                {/*
                      SPEED INDEX FIX 2 — Blocking theme script.

                      Runs synchronously before ANY CSS is parsed. Sets the correct
                      theme class on <html> at the very first paint so the browser
                      never shows the wrong background color (the white flash that
                      appears as "blank" frames in Speed Index measurements).

                      This is intentionally a blocking script — it MUST run before
                      paint to be effective. It is ~200 bytes (trivial).
                    */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                      (function(){
                        try{
                          var t=localStorage.getItem('theme');
                          var d=document.documentElement;
                          if(t==="dark"||(!t)){
                            d.classList.add('dark');
                          } else if(t==="light"){
                            d.classList.remove('dark');
                          }
                        }catch(e){}
                      })();
                    `}} />

                {/*
                      SPEED INDEX FIX 3 — No-transition guard.

                      CSS transitions on `body` and `section` (background-color: 0.3s)
                      cause the dark background to FADE IN over 300ms from white.
                      Lighthouse's screenshotter captures this transition as partially
                      painted frames, inflating Speed Index significantly.

                      This script disables all transitions for 100ms then removes
                      itself. By then the page has fully painted its initial state.
                    */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                      (function(){
                        var s=document.createElement('style');
                        s.id='no-transition';
                        s.textContent='*,*::before,*::after{transition:none!important}';
                        document.head.appendChild(s);
                        window.addEventListener('DOMContentLoaded',function(){
                          requestAnimationFrame(function(){
                            requestAnimationFrame(function(){
                              var el=document.getElementById('no-transition');
                              if(el)el.remove();
                            });
                          });
                        });
                      })();
                    `}} />
            </head>
            <body className={`${inter.variable} ${ibmPlexArabic.variable} antialiased font-sans bg-background text-foreground`}><RootProviders locale={locale} messages={messages}><Navbar />{children}<LazyLayoutParts /><Analytics /></RootProviders><script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "ALMSTKSHF",
                        "url": "https://almstkshf.com",
                        "logo": "https://almstkshf.com/logo.png",
                        "sameAs": [
                            "https://twitter.com/almstkshf",
                            "https://linkedin.com/company/almstkshf"
                        ]
                    })
                }}
            />
            </body>
        </html>
    );
}
