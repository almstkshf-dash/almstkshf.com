import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function LexcuraLawyerPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-20">
            <h1 className="text-4xl font-bold text-white mb-6">{t("lexcura_lawyer")}</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
                Our AI-powered legal assistant leverages advanced NLP to analyze case files, draft legal documents, and provide predictive analysis for legal outcomes.
            </p>
        </Container>
    );
}
