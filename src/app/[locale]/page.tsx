import HeroSection from "@/components/HeroSection";
import HomeClient from "@/components/HomeClient";
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
            canonical: `https://www.almstkshf.com/${locale}`,
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
export default function Home() {
    return (
        <main className="min-h-screen bg-background overflow-x-hidden">
            {/* Server-rendered hero — LCP element paints here */}
            <HeroSection />

            {/* Client-side animated sections — below the fold */}
            <HomeClient />
        </main>
    );
}
