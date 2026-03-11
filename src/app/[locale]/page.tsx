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

export default function Home() {
    return <HomeClient />;
}
