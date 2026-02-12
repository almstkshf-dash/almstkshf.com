import LexcoraClient from "@/components/LexcoraClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "ليكسكورا | جناح ERP القانوني المتقدم" : "LEXCORA | Advanced Legal ERP Suite",
        description: isAr
            ? "اكتشف كيف يغير ليكسكورا العمل القانوني لشركات المحاماة الكبرى باستخدام الذكاء الاصطناعي والأتمتة."
            : "Discover how LEXCORA transforms legal workflows for high-net-worth law firms with AI and automation.",
    };
}

export default function LexcoraPage() {
    return <LexcoraClient />;
}
