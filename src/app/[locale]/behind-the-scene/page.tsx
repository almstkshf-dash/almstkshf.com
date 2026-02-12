import BehindTheSceneClient from "@/components/BehindTheSceneClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "خلف الكواليس | فريق الإدارة" : "Behind the Scene | Management Team",
        description: isAr
            ? "تعرف على الفريق القيادي وراء منظومة ذكاء المستكشف."
            : "Meet the leadership team behind the Almstkshf intelligence ecosystem.",
    };
}

export default function BehindTheScenePage() {
    return <BehindTheSceneClient />;
}
