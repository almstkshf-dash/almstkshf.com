"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import Container from "@/components/ui/Container";
import Image from "next/image";
import clsx from "clsx";

export default function Navbar() {
    const t = useTranslations("Navigation");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleLocale = () => {
        const newLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: newLocale });
    };

    const isRTL = locale === "ar";

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-slate-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/80">
                <Container>
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tighter text-white group z-50 relative">
                            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
                                <Image
                                    src="/logo.png"
                                    alt={tCommon('app_name')}
                                    width={48}
                                    height={48}
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {tCommon('app_name')}
                            </span>
                        </Link>

                        {/* Desktop Navigation - Hidden on tablet, visible on large screens */}
                        <nav className="hidden lg:flex items-center gap-8 ms-auto me-8">
                            {NAVIGATION_ITEMS.map((item) => {
                                const isActive = pathname.includes(item.href || item.label);

                                if (item.children) {
                                    return (
                                        <div
                                            key={item.label}
                                            className="relative group py-4"
                                            onMouseEnter={() => setActiveDropdown(item.label)}
                                            onMouseLeave={() => setActiveDropdown(null)}
                                        >
                                            <button
                                                className={clsx(
                                                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                                                    isActive ? "text-primary" : "text-slate-300"
                                                )}
                                            >
                                                {item.icon && <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />}
                                                <span>{t(item.label)}</span>
                                                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 opacity-50" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <AnimatePresence>
                                                {activeDropdown === item.label && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={clsx(
                                                            "absolute top-[80%] w-80 p-2 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl z-50",
                                                            "start-0 ltr:origin-top-left rtl:origin-top-right"
                                                        )}
                                                    >
                                                        <div className="grid gap-1">
                                                            {item.children.map((child) => (
                                                                <Link
                                                                    key={child.label}
                                                                    href={child.href as any}
                                                                    className="block p-3 rounded-lg hover:bg-white/5 transition-all group/item"
                                                                    onClick={() => setActiveDropdown(null)}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="mt-1 p-2 bg-slate-900 rounded-md group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors text-slate-400 border border-slate-800 group-hover/item:border-primary/20">
                                                                            {child.icon && <child.icon className="w-4 h-4" />}
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-semibold text-slate-200 group-hover/item:text-primary">
                                                                                {t(child.label)}
                                                                            </div>
                                                                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed opacity-80">
                                                                                {t(`${child.label}_desc` as any)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href as any}
                                        className={clsx(
                                            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                                            isActive ? "text-primary" : "text-slate-300"
                                        )}
                                    >
                                        {item.icon && <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />}
                                        {t(item.label)}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Action Buttons - Visible on Desktop */}
                        <div className="hidden lg:flex items-center gap-4">
                            <button
                                onClick={toggleLocale}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                                aria-label="Switch Language"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span>{isRTL ? "English" : "العربية"}</span>
                            </button>
                            <Link
                                href="/contact"
                                className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                            >
                                {t('get_started')}
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle - Visible on Tablet and below */}
                        <button
                            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-8 h-8" />
                        </button>
                    </div>
                </Container>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl lg:hidden overflow-y-auto"
                    >
                        <Container>
                            <div className="flex flex-col min-h-screen py-6">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                                            <Image
                                                src="/logo.png"
                                                alt={tCommon('app_name')}
                                                width={40}
                                                height={40}
                                                className="object-contain"
                                            />
                                        </div>
                                        <span className="font-bold text-xl text-white">
                                            {tCommon('app_name')}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-8 h-8" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-6">
                                    {NAVIGATION_ITEMS.map((item) => (
                                        <div key={item.label} className="space-y-4">
                                            {item.children ? (
                                                <div className="space-y-3">
                                                    <div className="text-xs font-bold text-primary/80 uppercase tracking-widest px-2 py-1">
                                                        {t(item.label)}
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 ps-4 border-s-2 border-white/5">
                                                        {item.children.map(child => (
                                                            <Link
                                                                key={child.label}
                                                                href={child.href as any}
                                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <div className="p-2 bg-slate-900 rounded-lg text-slate-400 group-hover:text-primary transition-colors border border-slate-800">
                                                                    {child.icon && <child.icon className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-slate-200 group-hover:text-white">
                                                                        {t(child.label)}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.href as any}
                                                    className="flex items-center gap-4 p-3 text-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <div className="p-1">
                                                        {item.icon && <item.icon className="w-6 h-6" />}
                                                    </div>
                                                    {t(item.label)}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4 sticky bottom-0 bg-slate-950 pb-6">
                                    <button
                                        onClick={() => { toggleLocale(); setMobileMenuOpen(false); }}
                                        className="flex items-center justify-center gap-3 p-4 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span className="font-medium">{isRTL ? "English" : "العربية"}</span>
                                    </button>

                                    <Link
                                        href="/contact"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full p-4 text-center font-bold text-lg bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                    >
                                        {t('get_started')}
                                    </Link>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
