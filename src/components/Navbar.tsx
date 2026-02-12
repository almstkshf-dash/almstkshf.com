"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import Container from "@/components/ui/Container";
import Link from "next/link";
import clsx from "clsx";

export default function Navbar() {
    const t = useTranslations("Navigation");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleLocale = () => {
        const newLocale = locale === "en" ? "ar" : "en";
        // Simple way to switch locale by replacing the path segment
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    const isRTL = locale === "ar";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
            <Container>
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-xl tracking-tighter text-white">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ALMSTKSHF</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
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
                                                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-blue-400 py-2",
                                                isActive ? "text-blue-400" : "text-slate-300"
                                            )}
                                        >
                                            {item.icon && <item.icon className="w-4 h-4" />}
                                            <span>{t(item.label)}</span>
                                            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {activeDropdown === item.label && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={clsx(
                                                        "absolute top-full w-64 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl",
                                                        isRTL ? "right-0" : "left-0"
                                                    )}
                                                >
                                                    <div className="grid gap-1">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.label}
                                                                href={`/${locale}${child.href}`}
                                                                className="block p-3 rounded-lg hover:bg-slate-800 transition-colors group/item"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-1 p-1.5 bg-slate-800 rounded-md group-hover/item:bg-blue-500/20 group-hover/item:text-blue-400 transition-colors">
                                                                        {child.icon && <child.icon className="w-4 h-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-slate-200 group-hover/item:text-white">
                                                                            {t(child.label)}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                                            {child.description}
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
                                        "text-sm font-medium transition-colors hover:text-blue-400 flex items-center gap-2",
                                        isActive ? "text-blue-400" : "text-slate-300"
                                    )}
                                >
                                    {item.icon && <item.icon className="w-4 h-4" />}
                                    {t(item.label)}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleLocale}
                            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
                            aria-label="Switch Language"
                        >
                            <Globe className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-slate-800"></div>
                        <button className="px-4 py-2 text-sm font-semibold bg-white text-slate-950 rounded-full hover:bg-slate-200 transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-300"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </Container>


            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: isRTL ? "100%" : "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? "100%" : "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={clsx(
                                "fixed top-0 bottom-0 w-[80%] max-w-sm bg-slate-950 border-r border-slate-800 z-50 p-6 overflow-y-auto",
                                isRTL ? "right-0 border-l border-r-0" : "left-0"
                            )}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-bold text-xl text-white">ALMSTKSHF</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {NAVIGATION_ITEMS.map((item) => (
                                    <div key={item.label} className="space-y-3">
                                        {item.children ? (
                                            <>
                                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    {t(item.label)}
                                                </div>
                                                <div className="pl-4 border-l border-slate-800 space-y-3">
                                                    {item.children.map(child => (
                                                        <Link
                                                            key={child.label}
                                                            href={`/${locale}${child.href}`}
                                                            className="block text-slate-300 hover:text-blue-400"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {t(child.label)}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <Link
                                                href={`/${locale}${item.href}`}
                                                className="block font-medium text-slate-200 hover:text-blue-400"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t(item.label)}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <button
                                    onClick={() => { toggleLocale(); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-2 text-slate-400 hover:text-white"
                                >
                                    <Globe className="w-5 h-5" />
                                    <span>{isRTL ? "English" : "العربية"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
