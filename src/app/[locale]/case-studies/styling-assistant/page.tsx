import StylingAssistantClient from "@/components/StylingAssistantClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "دراسة حالة: مساعد التنسيق الذكي" : "Case Study: Smart Styling Assistant",
        description: isAr
            ? "اكتشف كيف يغير مساعد التنسيق الذكي تجربة التسوق الرقمي باستخدام الذكاء الاصطناعي."
            : "Discover how Smart Styling Assistant revolutionizes digital shopping with AI.",
    };
}

export default function StylingAssistantPage() {
    return <StylingAssistantClient />;
}
