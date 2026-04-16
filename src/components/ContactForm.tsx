/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const submitContact = useMutation(api.contact.submit);
    const sendContactEmail = useAction(api.contact.sendContactEmail);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = t("error_required");
        if (!formData.email.trim()) {
            newErrors.email = t("error_required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("error_email");
        }
        if (!formData.subject.trim()) newErrors.subject = t("error_required");
        if (!formData.message.trim()) newErrors.message = t("error_required");

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setStatus("loading");
        setErrors({});

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
                setErrors({});
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
                    <label htmlFor="name" className="text-sm font-bold text-foreground/60 uppercase tracking-widest px-1">
                        {t("name")}
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("placeholders.name")}
                        autoComplete="name"
                        className={clsx(
                            "w-full bg-muted border rounded-2xl py-4 px-6 text-foreground placeholder:text-foreground/50 focus:outline-none transition-all",
                            errors.name ? "border-rose-500 ring-1 ring-rose-500/20" : "border-border focus:border-primary"
                        )}
                    />
                    {errors.name && <p className="text-xs font-bold text-rose-500 px-1 animate-in fade-in slide-in-from-top-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-foreground/60 uppercase tracking-widest px-1">
                        {t("email")}
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("placeholders.email")}
                        autoComplete="email"
                        className={clsx(
                            "w-full bg-muted border rounded-2xl py-4 px-6 text-foreground placeholder:text-foreground/50 focus:outline-none transition-all",
                            errors.email ? "border-rose-500 ring-1 ring-rose-500/20" : "border-border focus:border-primary"
                        )}
                    />
                    {errors.email && <p className="text-xs font-bold text-rose-500 px-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-foreground/60 uppercase tracking-widest px-1">
                    {t("subject")}
                </label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("placeholders.subject")}
                    autoComplete="on"
                    className={clsx(
                        "w-full bg-muted border rounded-2xl py-4 px-6 text-foreground placeholder:text-foreground/50 focus:outline-none transition-all",
                        errors.subject ? "border-rose-500 ring-1 ring-rose-500/20" : "border-border focus:border-primary"
                    )}
                />
                {errors.subject && <p className="text-xs font-bold text-rose-500 px-1 animate-in fade-in slide-in-from-top-1">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-foreground/60 uppercase tracking-widest px-1">
                    {t("message")}
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t("placeholders.message")}
                    autoComplete="on"
                    className={clsx(
                        "w-full bg-muted border rounded-2xl py-4 px-6 text-foreground placeholder:text-foreground/50 focus:outline-none transition-all resize-none",
                        errors.message ? "border-rose-500 ring-1 ring-rose-500/20" : "border-border focus:border-primary"
                    )}
                />
                {errors.message && <p className="text-xs font-bold text-rose-500 px-1 animate-in fade-in slide-in-from-top-1">{errors.message}</p>}
            </div>

            {status === "error" && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm animate-in zoom-in-95 duration-200">
                    <AlertCircle className="w-5 h-5" />
                    {t("error")}
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-14 text-base font-extrabold uppercase tracking-widest"
                isLoading={status === "loading"}
                rightIcon={<Send className="w-4 h-4" />}
            >
                {t("send")}
            </Button>
        </form>
    );
}
