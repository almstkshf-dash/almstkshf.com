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

export const metadata: Metadata = {
    title: "ALMSTKSHF",
    description: "Advanced Media & Legal Solutions",
};

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
        <html lang={locale} dir={dir} suppressHydrationWarning>
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
