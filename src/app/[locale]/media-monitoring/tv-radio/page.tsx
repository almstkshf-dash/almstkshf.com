import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import MediaMonitoringDashboard from "@/components/MediaMonitoringDashboard";

export default function TvRadioPage() {
    const t = useTranslations("Navigation");
    return (
        <Container className="py-10">
            <h1 className="text-3xl font-bold text-white mb-6">{t("tv_radio_monitoring")}</h1>
            <MediaMonitoringDashboard />
        </Container>
    );
}
