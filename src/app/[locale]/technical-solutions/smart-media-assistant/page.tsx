import SmartMediaAssistantClient from "@/components/SmartMediaAssistantClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "مساعد الوسائط الذكي | قدرات الذكاء الاصطناعي المتقدمة" : "Smart Media Assistant | Advanced AI Capabilities",
        description: isAr
            ? "قدرات الذكاء الاصطناعي من المستكشف لإنشاء المحتوى عند الطلب ودعم استراتيجية الاتصال."
            : "Almstkshf AI capabilities for on-demand content generation and communication strategy support.",
    };
}

export default function SmartMediaAssistantPage() {
    return <SmartMediaAssistantClient />;
}
