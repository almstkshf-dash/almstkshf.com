import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function KYCPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-20">
            <h1 className="text-4xl font-bold text-white mb-6">{t("kyc_compliance")}</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
                Secure and compliant identity verification solutions integrated directly into your onboarding flow.
            </p>
        </Container>
    );
}
