import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function SmartMediaAssistantPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-20">
            <h1 className="text-4xl font-bold text-white mb-6">{t("smart_media_assistant")}</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
                Automated transcription and sentiment analysis for audio and video content, enabling rapid insight generation from media assets.
            </p>
        </Container>
    );
}
