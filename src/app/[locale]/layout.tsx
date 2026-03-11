import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConvexClientProvider } from '@/app/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { routing } from '@/i18n/config';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next";
import LazyLayoutParts from '@/components/LazyLayoutParts';


const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    preload: true,  // Ensure font is in the earliest request
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    weight: ["400", "700"],  // Reduced from 4 weights → 2 weights (saves ~30 KB)
    variable: "--font-ibm-plex-arabic",
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
        <ClerkProvider dynamic={true}>
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
                </head>
                <body className={`${inter.variable} ${ibmPlexArabic.variable} antialiased font-sans bg-background text-foreground`}>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <ConvexClientProvider>
                            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                                <Navbar />
                                {children}
                                <LazyLayoutParts />
                                <Analytics />
                            </ThemeProvider>
                        </ConvexClientProvider>
                    </NextIntlClientProvider>
                    <script
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
        </ClerkProvider>
    );
}
