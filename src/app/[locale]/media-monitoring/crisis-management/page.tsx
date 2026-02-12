import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import MediaMonitoringDashboard from "@/components/MediaMonitoringDashboard";

export default function CrisisManagementPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-10">
            <h1 className="text-3xl font-bold text-white mb-6 text-rose-500">{t("crisis_management")}</h1>
            <MediaMonitoringDashboard />
        </Container>
    );
}
