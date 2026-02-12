import MediaPulseClient from "@/components/MediaPulseClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "نبض الإعلام - رصد فوري للعلامة التجارية" : "Media Pulse - Real-time Brand Tracking",
        description: isAr
            ? "رصد وتحليل فوري للرأي العام وتغطية العلامة التجارية عبر آلاف المصادر العالمية."
            : "Real-time tracking and analysis of public opinion and brand coverage across thousands of global sources.",
    };
}

export default function MediaPulsePage() {
    return <MediaPulseClient />;
}
