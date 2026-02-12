import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function MediaPulsePage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-20">
            <h1 className="text-4xl font-bold text-white mb-6 animate-pulse">{t("media_pulse")}</h1>
            <div className="h-64 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <span className="text-slate-500">Live Sentiment Analysis Chart (Placeholder)</span>
            </div>
        </Container>
    );
}
