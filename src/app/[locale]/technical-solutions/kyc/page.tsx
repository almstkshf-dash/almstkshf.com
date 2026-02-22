"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { UserCheck, RefreshCw, ShieldCheck, Database, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function KYCPage() {
    const t = useTranslations("TechnicalSolutions.kyc");
    const tNav = useTranslations("Navigation");
    const locale = useLocale();

    const features = [
        {
            key: "goaml",
            icon: RefreshCw,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            key: "control",
            icon: ShieldCheck,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            key: "audit",
            icon: FileText,
            color: "text-amber-700 dark:text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            key: "risk",
            icon: Database,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10",
        }
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background text-foreground overflow-hidden">
            <Container>
                {/* Header */}
                <div className="mb-16 text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                    >
                        <UserCheck className="w-5 h-5 text-primary" />
                        <span className="text-primary font-semibold tracking-wide uppercase text-sm">{tNav("kyc_compliance")}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight bg-gradient-to-r from-foreground via-primary to-primary/70 bg-clip-text text-transparent"
                    >
                        {t("title")}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
                    >
                        {t("intro")}
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-xl group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                {t(`features.${feature.key}.title`)}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-lg font-light">
                                {t(`features.${feature.key}.desc`)}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-16 text-center border border-primary/10"
                >
                    <div className="absolute inset-0 bg-primary/5"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80"></div>

                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                            {t("cta")}
                        </h2>

                        <div className="flex justify-center">
                            <Link
                                href={`/${locale}/contact`}
                                className="px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-1 inline-block"
                            >
                                {tNav("contact")}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </main>
    );
}
