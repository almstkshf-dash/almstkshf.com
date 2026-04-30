"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, Info, X, Zap } from "lucide-react";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/routing";
import CheckoutButton from "@/components/CheckoutButton";
import { motion, AnimatePresence } from "framer-motion";

const plans = [
    {
        productId: "standard",
        price: 199,
        highlight: false,
    },
    {
        productId: "professional",
        price: 299,
        highlight: true,
    },
    {
        productId: "enterprise",
        price: 399,
        highlight: false,
    },
];

export default function PricingPage() {
    const t = useTranslations("Pricing");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [showExitModal, setShowExitModal] = useState(false);
    const [hasExited, setHasExited] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasExited) {
                setShowExitModal(true);
                setHasExited(true);
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, [hasExited]);

    const calculatePrice = (basePrice: number) => {
        if (billingCycle === "annual") {
            const annualPrice = basePrice * 12 * 0.85; // 15% discount
            return Math.round(annualPrice / 12);
        }
        return basePrice;
    };

    return (
        <div className="min-h-screen bg-background py-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

            <Container>
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
                    >
                        {t("title")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        {t("description")}
                    </motion.p>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center justify-center gap-4 mt-8"
                    >
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t("billing_monthly")}
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                            className="relative w-14 h-7 bg-muted rounded-full p-1 transition-colors hover:bg-muted/80 border border-border"
                        >
                            <motion.div
                                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                className="w-5 h-5 bg-primary rounded-full shadow-lg"
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {t("billing_annual")}
                            </span>
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {t("save_badge")}
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-20">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.productId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className={`relative rounded-3xl p-8 border h-full flex flex-col ${plan.highlight
                                ? "border-primary bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/20 scale-105 z-10"
                                : "border-border bg-card/30 backdrop-blur-sm hover:border-border/80"
                                } transition-all duration-500 group`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary/40">
                                    {t("recommended")}
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-foreground">
                                    {t(`plans.${plan.productId}.name`)}
                                </h3>
                                <p className="text-muted-foreground mt-2 text-sm min-h-[40px]">
                                    {t(`plans.${plan.productId}.description`)}
                                </p>
                                <div className="mt-8 flex items-baseline gap-1">
                                    <span className="text-lg font-medium text-muted-foreground">{t("currency")}</span>
                                    <span className="text-5xl font-black text-foreground tracking-tight">
                                        {calculatePrice(plan.price).toLocaleString()}
                                    </span>
                                    <span className="text-muted-foreground font-medium">{t("per_month")}</span>
                                </div>
                                {billingCycle === 'annual' && (
                                    <p className="text-primary text-xs font-semibold mt-2">
                                        {t("discount_info")}
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {(t.raw(`plans.${plan.productId}.features`) as string[]).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                        <div className="mt-1 bg-primary/10 rounded-full p-0.5">
                                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto">
                                <CheckoutButton
                                    productId={plan.productId}
                                    billingCycle={billingCycle}
                                    className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg ${plan.highlight
                                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 hover:scale-[1.02]'
                                        : 'bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-primary/30'
                                        }`}
                                >
                                    {t("subscribe_now")}
                                </CheckoutButton>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Specialized Solutions Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center border-t border-border pt-16"
                >
                    <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {t("specialized_solutions")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['kyc', 'go-aml', 'dark-web'].map((key) => (
                            <div key={key} className="p-8 rounded-2xl bg-card/40 border border-border hover:border-primary/30 hover:bg-card/60 transition-all duration-300 group">
                                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {t(`specialized.${key}.name`)}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t(`specialized.${key}.description`)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 p-8 rounded-3xl bg-muted/30 border border-border/50">
                        <p className="text-muted-foreground mb-6 text-lg font-medium">
                            {t("enterprise_prompt")}
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-lg group"
                        >
                            {t("enterprise_link_text")}
                            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                        </Link>
                    </div>
                </motion.div>
            </Container>

            {/* Exit-Intent Modal */}
            <AnimatePresence>
                {showExitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-card border border-primary/30 rounded-[2.5rem] p-10 shadow-3xl shadow-primary/20 overflow-hidden"
                        >
                            {/* Decorative background elements for modal */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                            <button
                                onClick={() => setShowExitModal(false)}
                                className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50 z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="relative z-10 text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-2">
                                    <Zap className="w-10 h-10 fill-primary/20" />
                                </div>

                                <h2 className="text-4xl font-black tracking-tight text-foreground">
                                    {t("free_trial_title")}
                                </h2>

                                <p className="text-xl text-muted-foreground leading-relaxed max-w-md mx-auto">
                                    {t("free_trial_desc")}
                                </p>

                                <div className="pt-4 space-y-4">
                                    <CheckoutButton
                                        productId="professional"
                                        isTrial={true}
                                        billingCycle="monthly"
                                        className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {t("free_trial_cta")}
                                    </CheckoutButton>
                                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Info className="w-4 h-4" />
                                        {t("free_trial_note")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
