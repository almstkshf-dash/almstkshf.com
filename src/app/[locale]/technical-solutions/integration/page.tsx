"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import IntegrationHub from "@/components/IntegrationHub";
import { Key } from "lucide-react";
import { motion } from "framer-motion";

export default function IntegrationPage() {
    const t = useTranslations("Navigation");

    return (
        <main className="min-h-screen pt-32 pb-20">
            <Container>
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Key className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                            {t("integration_hub")}
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg max-w-2xl"
                    >
                        Manage your secure connections to the ALMSTKSHF ecosystem. Provision API keys, set webhooks, and monitor service health.
                    </motion.p>
                </div>

                <div className="max-w-5xl">
                    <IntegrationHub />
                </div>
            </Container>
        </main>
    );
}
