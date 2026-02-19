"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { Sparkles, ArrowRight, CheckCircle2, Loader2, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function StylingAssistantClient() {
    const t = useTranslations("CaseStudies.styling");
    const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
    const sendWaitlistEmails = useAction(api.waitlist.sendWaitlistEmails);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMsg("");

        try {
            const result = await joinWaitlist({
                email,
                name,
                service: "styling_assistant"
            });

            // Only send emails if this is a new signup (not already exists)
            if (result && !result.alreadyExists) {
                sendWaitlistEmails({
                    email,
                    name,
                    service: "Styling Assistant"
                }).catch(error => {
                    console.error("Failed to send emails:", error);
                    // Email failure doesn't affect form submission success
                });
            }

            setStatus("success");
            setName("");
            setEmail("");
        } catch (error) {
            console.error(error);
            setStatus("error");
            setErrorMsg(t("form.error"));
        }
    };

    return (
        <main className="min-h-screen pb-20 bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent blur-[120px] opacity-60 pointer-events-none"></div>

                <Container>
                    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-purple-500/30 text-purple-600 dark:text-purple-300 text-sm font-semibold uppercase tracking-widest backdrop-blur-md shadow-xl"
                        >
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>{t("title")}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-tight"
                        >
                            {t("subtitle")}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
                        >
                            {t("intro")}
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* Content & Form Split */}
            <section className="py-12 md:py-24">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div className="space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative rounded-3xl overflow-hidden border border-border shadow-2xl shadow-purple-900/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent pointer-events-none z-10"></div>
                                <Image
                                    src="/virtual-stylist.png"
                                    alt="Virtual Stylist Interface"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {t("desc1")}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                                    <ArrowRight className="w-6 h-6 text-purple-400" />
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {t("desc2")}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                            >
                                <p className="text-xl font-bold text-foreground text-center">
                                    {t("cta_join")}
                                </p>
                            </motion.div>
                        </div>

                        {/* Waitlist Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                            <div className="relative z-10 space-y-8">
                                <div>
                                    <h3 className="text-3xl font-bold text-foreground mb-2">{t("form.title")}</h3>
                                    <p className="text-muted-foreground">{t("cta_button")}</p>
                                </div>

                                {status === "success" ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 text-center space-y-4"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-foreground">{t("form.success")}</h4>
                                        <p className="text-muted-foreground">We&apos;ll let you know as soon as we launch.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="styling-name" className="text-sm font-medium text-muted-foreground ml-1">{t("form.name")}</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-purple-400 transition-colors rtl:right-4 rtl:left-auto" />
                                                <input
                                                    id="styling-name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder={t("form.placeholder_name")}
                                                    autoComplete="name"
                                                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all rtl:pr-12 rtl:pl-4"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="styling-email" className="text-sm font-medium text-muted-foreground ml-1">{t("form.email")}</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-purple-400 transition-colors rtl:right-4 rtl:left-auto" />
                                                <input
                                                    id="styling-email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder={t("form.placeholder_email")}
                                                    autoComplete="email"
                                                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all rtl:pr-12 rtl:pl-4"
                                                />
                                            </div>
                                        </div>

                                        {status === "error" && (
                                            <p className="text-rose-400 text-sm text-center bg-rose-500/10 py-2 rounded-lg">{errorMsg}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === "submitting"}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {status === "submitting" ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>{t("form.submitting")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{t("form.submit")}</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>
        </main>
    );
}
