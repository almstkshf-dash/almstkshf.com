"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function NotificationBell() {
    const [mounted, setMounted] = useState(false);
    const t = useTranslations("Notifications");
    const unreadNotifications = useQuery(api.monitoring.getUnreadNotifications) || [];
    const markAsRead = useMutation(api.monitoring.markNotificationAsRead);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDismiss = async (id: any) => {
        await markAsRead({ id });
    };

    if (!mounted) {
        return <div className="w-9 h-9 rounded-full border border-border bg-background" />;
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center relative"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 text-foreground/80" />
                {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-2xl z-[100] overflow-hidden"
                    >
                        <div className="p-3 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm">{t("title")}</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {unreadNotifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-foreground/50">
                                    {t("no_new")}
                                </div>
                            ) : (
                                unreadNotifications.map(notif => (
                                    <div key={notif._id} className="p-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="text-sm font-medium">{t(notif.title as any)}</h4>
                                                <p className="text-xs text-foreground/70 mt-1">{notif.message}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDismiss(notif._id)}
                                                className="text-xs text-primary hover:underline shrink-0"
                                            >
                                                {t("dismiss")}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
