"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";

export default function ChatbotTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const locale = useLocale();
    const isRTL = locale === "ar";

    useEffect(() => {
        const checkChatbase = setInterval(() => {
            if (window.chatbase && typeof window.chatbase === "function") {
                setIsLoaded(true);
                clearInterval(checkChatbase);
            }
        }, 500);

        setTimeout(() => clearInterval(checkChatbase), 15000);
        return () => clearInterval(checkChatbase);
    }, []);

    const toggleChat = () => {
        if (!isLoaded) return;

        if (isOpen) {
            window.chatbase("close");
        } else {
            window.chatbase("open");
        }
        setIsOpen(!isOpen);
    };

    // Listen for chatbase events if possible, or just sync state
    useEffect(() => {
        const handleStateChange = () => {
            // Chatbase doesn't always emit events we can easily catch without their SDK
            // but we can try to poll the visibility of their iframe
            const iframe = document.getElementById("chatbase-message-window") || document.querySelector('iframe[src*="chatbase"]');
            if (iframe) {
                const isVisible = window.getComputedStyle(iframe).display !== "none";
                setIsOpen(isVisible);
            }
        };

        const interval = setInterval(handleStateChange, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!isLoaded) return null;

    return (
        <div
            className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-[9999] flex flex-col items-end gap-4`}
        >
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className={`bg-white dark:bg-slate-900 border border-border rounded-2xl p-4 shadow-2xl max-w-[200px] ${isRTL ? "mr-12 text-right" : "ml-12 text-left"}`}
                    >
                        <p className="text-xs font-medium text-foreground">
                            {isRTL ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help you today?"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className="relative group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary text-primary-foreground rounded-full shadow-2xl shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all"
                aria-label={isOpen ? "Close chat" : "Open chat"}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></div>

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center"
                        >
                            <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
