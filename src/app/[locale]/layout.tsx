import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConvexClientProvider } from '@/app/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { routing } from '@/i18n/config';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import ChatbaseWidget from '@/components/ChatbaseWidget';
import ChatbotTrigger from '@/components/ChatbotTrigger';
import { Analytics } from "@vercel/analytics/next"
import { CommandMenu } from "@/components/CommandMenu";
import { Toaster } from "sonner";

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
    maximumScale: 1,
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
        keywords: ["AI", "Media Monitoring", "Legal Tech", "UAE", "Data Analysis", "Strategic Advisor"],
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
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.ico",
            apple: "/logo.png",
        },
        metadataBase: new URL("https://almstkshf.com"),
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
        <ClerkProvider dynamic={false}>
            <html lang={locale} dir={dir} className="scroll-smooth" suppressHydrationWarning>
                <body className={`${inter.variable} ${ibmPlexArabic.variable} antialiased font-sans bg-background text-foreground`}>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <ConvexClientProvider>
                            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                                <Navbar />
                                {children}
                                <CommandMenu />
                                <Toaster richColors position="top-center" />
                                <Analytics />
                                <Footer />
                                <ChatbaseWidget />
                                <ChatbotTrigger />
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
