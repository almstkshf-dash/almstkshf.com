import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function IntegrationPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-20">
            <h1 className="text-4xl font-bold text-white mb-6">{t("integration_hub")}</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
                Centralized management for third-party API keys and service integrations.
            </p>
        </Container>
    );
}
