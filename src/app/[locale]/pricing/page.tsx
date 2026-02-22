"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check, Info } from "lucide-react";
import Container from "@/components/ui/Container";
import { Link } from "@/i18n/routing";
import CheckoutButton from "@/components/CheckoutButton";
import { motion } from "framer-motion";

const plans = [
    {
        productId: "monthly-analysis-report",
        name: "Monthly Analysis Report",
        description: "Tailor-made reports tailored to your specifications.",
        price: 2900,
        currency: "AED",
        features: [
            "Tailored Monthly Analysis",
            "Print & Online Metrics",
            "Vote Value, PR Value, Reach",
            "Sentiment & Trend Analysis",
            "Social Metrics (Up to 2k results)",
        ],
        highlight: false,
        contactOnly: false,
    },
    {
        productId: "broadcast-monitoring",
        name: "Broadcast Monitoring",
        description: "Ongoing monitoring for Radio & TV channels.",
        price: 2990,
        currency: "AED",
        features: [
            "Monitor 5 Radio/TV Channels",
            "Uploaded to Media Eye Portal",
            "Summary & Metadata",
            "24/7 Coverage",
            "Add-on: 440 AED per extra channel",
        ],
        highlight: false,
        contactOnly: false,
    },
    {
        productId: "online-media-monitoring",
        name: "Online Media Monitoring",
        description: "Comprehensive coverage for Gulf & UAE regions.",
        price: 3200,
        currency: "AED",
        features: [
            "50 Saved Keyword Searches",
            "Unlimited Variations",
            "Automated Content Capture",
            "Media Pulse Portal Access",
            "Unlimited Volume (UAE Only)",
        ],
        highlight: true,
        contactOnly: false,
    },
    {
        productId: "social-media-monitoring",
        name: "Social Media Monitoring",
        description: "Curated tracking for major social platforms.",
        price: 5300,
        currency: "AED",
        features: [
            "Instagram, Facebook, X, LinkedIn",
            "50 Keywords/Hashtags",
            "Daily Email Results (5 days/week)",
            "Sentiment & Trend Analysis",
            "Cap at 2,000 Results/month",
        ],
        highlight: false,
        contactOnly: false,
    },
    {
        productId: null,
        name: "Business Suite",
        description: "The complete monitoring and archiving solution.",
        price: null,
        currency: "AED",
        features: [
            "All Monitoring Services Included",
            "24/7 Online Portal Access",
            "10 User Accounts",
            "Unlimited Clipping Archive",
            "Customizable Daily Alerts (Up to 4/day)",
        ],
        highlight: false,
        contactOnly: true,
    },
];

const customSolutions = [
    {
        name: "KYC Compliance",
        description: "Automated identity verification.",
    },
    {
        name: "GO-AML Integration",
        description: "Anti-money laundering compliance.",
    },
    {
        name: "Dark Web Scrape",
        description: "Deep web monitoring and threat intelligence.",
    },
];

export default function PricingPage() {
    const t = useTranslations("Pricing");
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
                        Choose the right media intelligence package for your organization.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20"
                    >
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Get 5% discount on annual subscriptions</span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-20">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className={`relative rounded-2xl p-8 border h-full flex flex-col ${plan.highlight
                                ? "border-primary bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/20 scale-105 z-10"
                                : "border-border bg-card/30 backdrop-blur-sm hover:border-border/80"
                                } transition-all duration-300`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-foreground min-h-[56px] flex items-center">{plan.name}</h3>
                                <p className="text-muted-foreground mt-2 text-sm min-h-[40px]">{plan.description}</p>
                                <div className="mt-6 flex items-baseline gap-1">
                                    {plan.price ? (
                                        <>
                                            <span className="text-lg font-medium text-muted-foreground">AED</span>
                                            <span className="text-4xl font-bold text-foreground">{plan.price.toLocaleString()}</span>
                                            <span className="text-muted-foreground">/mo</span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-foreground">Contact Sales</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/70">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto">
                                {plan.contactOnly || !plan.price ? (
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold border border-border transition-all"
                                    >
                                        Contact Sales
                                    </Link>
                                ) : (
                                    <CheckoutButton
                                        productId={plan.productId as string}
                                        className={`w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80 text-foreground border border-border'}`}
                                    >
                                        Subscribe Now
                                    </CheckoutButton>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Custom Solutions Section */}
                <div className="max-w-4xl mx-auto text-center border-t border-border pt-16">
                    <h2 className="text-3xl font-bold mb-8">Specialized Solutions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {customSolutions.map((sol) => (
                            <div key={sol.name} className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                                <h3 className="text-lg font-semibold text-foreground mb-2">{sol.name}</h3>
                                <p className="text-sm text-muted-foreground">{sol.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <p className="text-muted-foreground mb-4">
                            Looking for KYC, GO-AML compliance, or Dark Web specialized monitoring?
                        </p>
                        <Link href="/contact" className="text-primary font-semibold hover:underline">
                            Contact our Enterprise Team &rarr;
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
