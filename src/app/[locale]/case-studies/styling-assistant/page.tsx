import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function StylingAssistantPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-20">
            <h1 className="text-4xl font-bold text-white mb-6">{t("styling_assistant")}</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
                A personalized styling engine that uses computer vision to recommend outfits based on body type, occasion, and current fashion trends.
            </p>
        </Container>
    );
}
