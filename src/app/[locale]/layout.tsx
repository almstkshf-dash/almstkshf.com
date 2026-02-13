import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConvexClientProvider } from '@/app/ConvexClientProvider';
import { routing } from '@/i18n/config';
import Footer from '@/components/Footer';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "700"],
    variable: "--font-ibm-plex-arabic",
    display: "swap",
});

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
        keywords: ["AI", "Media Monitoring", "Legal Tech", "UAE", "Data Analysis", "Strategic Advisor"],
        icons: {
            icon: "/favicon.png",
            apple: "/favicon.png",
        },
        openGraph: {
            type: "website",
            locale: locale === "ar" ? "ar_AE" : "en_US",
            url: `https://almstkshf.com/${locale}`,
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
            canonical: `https://almstkshf.com/${locale}`,
            languages: {
                en: "https://almstkshf.com/en",
                ar: "https://almstkshf.com/ar",
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

    const messages = await getMessages();
    const dir = locale === "ar" ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir} className="scroll-smooth" suppressHydrationWarning>
            <body className={`${inter.variable} ${ibmPlexArabic.variable} antialiased font-sans bg-background text-foreground`}>
                <NextIntlClientProvider messages={messages}>
                    <ConvexClientProvider>
                        {children}
                        <Footer />
                    </ConvexClientProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
