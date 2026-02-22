"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";

export default function ContactForm() {
    const t = useTranslations("Contact");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const submitContact = useMutation(api.contact.submit);
    const sendContactEmail = useAction(api.contact.sendContactEmail);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");

        try {
            // First, save to database
            const res = await submitContact(formData);

            if (res.success && res.submissionId) {
                // Then, send email
                sendContactEmail({
                    ...formData,
                    submissionId: res.submissionId as string,
                }).catch(error => {
                    console.error("Failed to send email:", error);
                });

                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                console.error("Contact submission failed:", res.error);
                setStatus("error");
            }
        } catch (error) {
            console.error("ContactForm internal error:", error);
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center flex flex-col items-center gap-4"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t("success")}</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus("idle")}
                    className="text-emerald-400 font-medium hover:underline text-sm h-auto p-0 hover:bg-transparent shadow-none"
                >
                    {t("send_another")}
                </Button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                        {t("name")}
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("placeholders.name")}
                        autoComplete="name"
                        className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                        {t("email")}
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("placeholders.email")}
                        autoComplete="email"
                        className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                    {t("subject")}
                </label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("placeholders.subject")}
                    autoComplete="on"
                    className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                    {t("message")}
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t("placeholders.message")}
                    autoComplete="on"
                    className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:border-primary transition-colors resize-none"
                />
            </div>

            {status === "error" && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                    <AlertCircle className="w-5 h-5" />
                    {t("error")}
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-14 text-base"
                isLoading={status === "loading"}
                rightIcon={<Send className="w-4 h-4" />}
            >
                {t("send")}
            </Button>
        </form>
    );
}
