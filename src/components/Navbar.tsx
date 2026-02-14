"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown, Search } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import Container from "@/components/ui/Container";
import Image from "next/image";
import Link from "next/link";
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
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    const isRTL = locale === "ar";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-slate-950/90 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/80">
            <Container>
                <div className="flex h-20 items-center justify-between">

                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-3 font-bold text-2xl tracking-tighter text-white group z-50 relative">
                        <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="ALMSTKSHF Logo"
                                width={48}
                                height={48}
                                className="object-contain p-1"
                            />
                        </div>
                        <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {tCommon('app_name')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 ml-auto mr-8">
                        {NAVIGATION_ITEMS.map((item) => {
                            const isActive = pathname.includes(item.href || item.label);

                            if (item.children) {
                                return (
                                    <div
                                        key={item.label}
                                        className="relative group"
                                        onMouseEnter={() => setActiveDropdown(item.label)}
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        <button
                                            className={clsx(
                                                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary py-2",
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
                                                        "absolute top-full w-72 p-2 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-xl z-50",
                                                        isRTL ? "right-0 origin-top-right" : "left-0 origin-top-left"
                                                    )}
                                                >
                                                    <div className="grid gap-1">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.label}
                                                                href={`/${locale}${child.href}`}
                                                                className="block p-3 rounded-lg hover:bg-slate-800/80 transition-all group/item"
                                                                onClick={() => setActiveDropdown(null)}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-1 p-2 bg-slate-800 rounded-md group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors text-slate-400">
                                                                        {child.icon && <child.icon className="w-4 h-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-semibold text-slate-200 group-hover/item:text-primary">
                                                                            {t(child.label)}
                                                                        </div>
                                                                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
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
                                    href={`/${locale}${item.href}`}
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

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleLocale}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                            aria-label="Switch Language"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{isRTL ? "English" : "العربية"}</span>
                        </button>
                        <Link
                            href={`/${locale}/contact`}
                            className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            {t('get_started')}
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="w-7 h-7" />
                    </button>
                </div>
            </Container>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl md:hidden overflow-y-auto"
                    >
                        <Container>
                            <div className="flex flex-col min-h-screen py-6">
                                <div className="flex items-center justify-between mb-12">
                                    <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                                            <Image
                                                src="/logo.png"
                                                alt="ALMSTKSHF Logo"
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
                                        className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
                                    >
                                        <X className="w-8 h-8" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-8">
                                    {NAVIGATION_ITEMS.map((item) => (
                                        <div key={item.label} className="space-y-4">
                                            {item.children ? (
                                                <div className="space-y-4">
                                                    <div className="text-sm font-bold text-primary uppercase tracking-widest px-2">
                                                        {t(item.label)}
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {item.children.map(child => (
                                                            <Link
                                                                key={child.label}
                                                                href={`/${locale}${child.href}`}
                                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <div className="p-2 bg-slate-900 rounded-lg text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all">
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
                                                    href={`/${locale}${item.href}`}
                                                    className="flex items-center gap-4 p-2 text-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.icon && <item.icon className="w-5 h-5" />}
                                                    {t(item.label)}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
                                    <button
                                        onClick={() => { toggleLocale(); setMobileMenuOpen(false); }}
                                        className="flex items-center justify-center gap-2 p-4 text-slate-300 hover:text-white bg-white/5 rounded-xl transition-colors"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Change Language to {isRTL ? "English" : "العربية"}</span>
                                    </button>

                                    <Link
                                        href={`/${locale}/contact`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full p-4 text-center font-bold bg-primary text-primary-foreground rounded-xl"
                                    >
                                        {t('get_started')}
                                    </Link>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
