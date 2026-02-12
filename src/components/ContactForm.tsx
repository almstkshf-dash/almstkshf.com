"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "./ui/Button";
import clsx from "clsx";

export default function ContactForm() {
    const t = useTranslations("Contact");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");

        // Mocking an API call
        setTimeout(() => {
            setStatus("success");
        }, 1500);
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
                <h3 className="text-xl font-bold text-white">{t("success")}</h3>
                <button
                    onClick={() => setStatus("idle")}
                    className="text-emerald-400 font-medium hover:underline text-sm"
                >
                    Send another message
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                        {t("name")}
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                        {t("email")}
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                    {t("subject")}
                </label>
                <input
                    type="text"
                    required
                    placeholder="Inquiry about Media Monitoring"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                    {t("message")}
                </label>
                <textarea
                    rows={6}
                    required
                    placeholder="How can we help you represent your brand?"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
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
