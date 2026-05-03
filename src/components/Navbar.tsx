/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useState, useEffect, Suspense, memo } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown, Search } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import Container from "@/components/ui/Container";
import Image from "next/image";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HoverPrefetchLink } from "@/components/ui/HoverPrefetchLink";
import Button from "@/components/ui/Button";
import dynamic from "next/dynamic";
import { NotificationBell } from "@/components/NotificationBell";

// Lazy-load all Clerk UI — keeps the ~186 KiB Clerk bundle out of the initial page load
const NavbarAuthSection = dynamic(
    () => import("@/components/NavbarAuthSection"),
    { ssr: false, loading: () => <div className="w-9 h-9 rounded-full bg-muted animate-pulse" aria-hidden="true" /> }
);
const MobileAuthFooter = dynamic(
    () => import("@/components/NavbarAuthSection").then(m => ({ default: m.MobileAuthFooter })),
    { ssr: false }
);

const NavbarContent = memo(function NavbarContent() {
    const t = useTranslations("Navigation");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const loginLabel = (t as any).has?.('login') ? t('login' as any) : "Sign In";

    const toggleLocale = () => {
        const newLocale = locale === "en" ? "ar" : "en";
        const paramsString = searchParams?.toString();
        const query = paramsString ? `?${paramsString}` : "";
        router.replace(`${pathname}${query}` as any, { locale: newLocale });
    };

    const isRTL = locale === "ar";

    /* ———————————————————————————————————————————————— */
    /* Shared icon size tokens                          */
    /* ———————————————————————————————————————————————— */
    const ICON_SM = "w-4 h-4";
    const ICON_MD = "w-[18px] h-[18px]";
    const ICON_LG = "w-5 h-5";
    const ACTION_BTN = "w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center";

    return (
        <>
            <div
                className="contents"
                onMouseLeave={() => setActiveDropdown(null)}
            >
                <Container className="max-w-none px-4 md:px-6">

                    <div className="flex h-16 items-center justify-between gap-2">

                        {/* ——— Logo ——— */}
                        <div onMouseEnter={() => setActiveDropdown(null)} className="shrink-0">
                            <HoverPrefetchLink href="/" aria-label={`${tCommon('app_name')} - Go to homepage`} className="flex items-center gap-2 group z-50 relative">
                                <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden shrink-0">
                                    <Image
                                        src="/logo.png"
                                        alt={tCommon('logo_alt')}
                                        fill
                                        sizes="32px"
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <span className="hidden xl:block font-bold text-lg tracking-tight text-foreground app-name">
                                    {tCommon('app_name')}
                                </span>
                            </HoverPrefetchLink>
                        </div>

                        {/* ——— Desktop Navigation ——— */}
                        <nav className="hidden lg:flex flex-1 justify-start items-center gap-1 ms-2">
                            {NAVIGATION_ITEMS.filter(item => item.href !== "/").map((item) => {
                                const isActive = pathname.includes(item.href || item.label);
                                const hasChildren = !!item.children;

                                if (hasChildren) {
                                    return (
                                        <div
                                            key={item.label}
                                            className="relative"
                                            onMouseEnter={() => setActiveDropdown(item.label)}
                                            onFocus={() => setActiveDropdown(item.label)}
                                        >
                                            <button
                                                className={clsx(
                                                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                                                    isActive || activeDropdown === item.label
                                                        ? "text-primary bg-primary/5"
                                                        : "text-foreground/85 hover:text-foreground hover:bg-muted"
                                                )}
                                                aria-expanded={activeDropdown === item.label}
                                                aria-haspopup="true"
                                            >
                                                {item.icon && (
                                                    <item.icon className={clsx(ICON_MD, "shrink-0")} aria-hidden="true" />
                                                )}
                                                <span className="nav-header">{t(item.label)}</span>
                                                <ChevronDown className={clsx(
                                                    ICON_SM, "shrink-0 transition-transform duration-200",
                                                    activeDropdown === item.label && "rotate-180"
                                                )} aria-hidden="true" />
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <HoverPrefetchLink
                                        key={item.label}
                                        href={item.href as any}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                                            isActive
                                                ? "text-primary bg-primary/5"
                                                : "text-foreground/85 hover:text-foreground hover:bg-muted"
                                        )}
                                        onMouseEnter={() => setActiveDropdown(null)}
                                        onFocus={() => setActiveDropdown(null)}
                                    >
                                        {item.icon && (
                                            <item.icon className={clsx(ICON_MD, "shrink-0")} aria-hidden="true" />
                                        )}
                                        <span className="nav-header">{t(item.label)}</span>
                                    </HoverPrefetchLink>
                                );
                            })}
                        </nav>

                        {/* ——— Action Buttons (Desktop) ——— */}
                        <div
                            className="hidden lg:flex items-center gap-2 shrink-0"
                            onMouseEnter={() => setActiveDropdown(null)}
                        >
                            {/* Search */}
                            <Button
                                variant="outline"
                                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }))}
                                className="px-2 py-1.5 bg-muted/50 hover:bg-muted border-border rounded-full flex items-center gap-3 transition-all group shadow-none h-auto"
                                aria-label={`${t('search')} - Press ⌘K to search`}
                            >
                                <Search className={ICON_SM} aria-hidden="true" />
                                <span className="hidden xl:flex items-center gap-1 text-xs text-foreground/85">
                                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] leading-none">⌘</kbd>
                                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] leading-none">K</kbd>
                                </span>
                            </Button>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Notifications */}
                            <NotificationBell />

                            {/* Language Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleLocale}
                                className="bg-muted hover:bg-muted/80 rounded-full h-10 w-10 relative flex items-center justify-center overflow-hidden border border-border group shadow-none"
                                aria-label={isRTL ? tCommon('switch_to_english') : tCommon('switch_to_arabic')}
                            >
                                <span className="font-bold text-xs group-hover:scale-110 transition-transform">
                                    {isRTL ? "EN" : "AR"}
                                </span>
                            </Button>

                            {/* Auth section — only after hydration, Clerk bundle loaded lazily */}
                            {mounted && (
                                <NavbarAuthSection
                                    loginLabel={loginLabel}
                                    dashboardLabel={t('dashboard')}
                                    settingsLabel={t('settings')}
                                    getStartedLabel={t('get_started')}
                                    iconSm={ICON_SM}
                                />
                            )}

                            {/* Fallback skeleton while Clerk loads */}
                            {!mounted && (
                                <div className={clsx(ACTION_BTN, "animate-pulse bg-muted")} aria-hidden="true" />
                            )}
                        </div>

                        {/* ——— Mobile Controls ——— */}
                        <div className="lg:hidden flex items-center gap-2 shrink-0">
                            {/* Mobile dashboard/avatar — shown after hydration via lazy Clerk chunk */}
                            {mounted && (
                                <NavbarAuthSection
                                    loginLabel={loginLabel}
                                    dashboardLabel={t('dashboard')}
                                    settingsLabel={t('settings')}
                                    getStartedLabel={t('get_started')}
                                    iconSm={ICON_SM}
                                />
                            )}

                            <ThemeToggle />

                            {/* Notifications (Mobile) */}
                            <NotificationBell />

                            <button
                                className={clsx(ACTION_BTN, "text-foreground")}
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label={tCommon('open_menu')}
                            >
                                <Menu className={ICON_LG} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* ——— Dropdown Menu ——— */}
                    <AnimatePresence>
                        {activeDropdown && NAVIGATION_ITEMS.find(i => i.label === activeDropdown)?.children && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border shadow-2xl z-[90]"
                            >
                                <div
                                    className="py-8"
                                    onMouseEnter={() => setActiveDropdown(activeDropdown)}
                                >
                                    <Container>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {NAVIGATION_ITEMS.find(i => i.label === activeDropdown)?.children?.map((child) => (
                                                <HoverPrefetchLink
                                                    key={child.label}
                                                    href={child.href as any}
                                                    className="block p-4 rounded-xl hover:bg-muted transition-all group/item border border-transparent hover:border-border"
                                                    onClick={() => setActiveDropdown(null)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 p-2 bg-muted rounded-lg group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors text-foreground/80 border border-border group-hover/item:border-primary/20">
                                                            {child.icon && <child.icon className={ICON_LG} aria-hidden="true" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">
                                                                {t(child.label)}
                                                            </div>
                                                            <div className="text-xs text-foreground/85 mt-1 line-clamp-2 leading-relaxed">
                                                                {t(`${child.label}_desc` as any)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </HoverPrefetchLink>
                                            ))}
                                        </div>
                                    </Container>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Container>
            </div>


            {/* ——— Mobile Menu Overlay ——— */}
            {mounted && createPortal(
                <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        className="fixed inset-0 z-[200] bg-background lg:hidden overflow-y-auto"
                    >
                        <Container>
                            <div className="flex flex-col min-h-screen py-4">
                                {/* Mobile Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                                    <HoverPrefetchLink href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                                        <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-border bg-background flex items-center justify-center">
                                            <Image
                                                src="/logo.png"
                                                alt={tCommon('logo_alt')}
                                                width={28}
                                                height={28}
                                                className="object-contain dark:brightness-0 dark:invert"
                                            />
                                        </div>
                                        <span className="font-bold text-lg text-foreground">
                                            {tCommon('app_name')}
                                        </span>
                                    </HoverPrefetchLink>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={clsx(ACTION_BTN, "text-foreground")}
                                        aria-label="Close menu"
                                    >
                                        <X className={ICON_LG} aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Mobile Navigation */}
                                <div className="flex-1 space-y-1">
                                    {NAVIGATION_ITEMS.map((item) => (
                                        <div key={item.label}>
                                            {item.children ? (
                                                <div className="space-y-1">
                                                    <div className="text-xs font-semibold text-foreground/85 uppercase tracking-wider px-3 py-2 nav-header">
                                                        {t(item.label)}
                                                    </div>
                                                    <div className="space-y-0.5 ps-3 border-s-2 border-border ms-3">
                                                        {item.children.map(child => (
                                                            <HoverPrefetchLink
                                                                key={child.label}
                                                                href={child.href as any}
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/85 hover:text-foreground hover:bg-muted transition-colors"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <div className="p-1.5 bg-muted rounded-md border border-border text-foreground/50" aria-hidden="true">
                                                                    {child.icon && <child.icon className={ICON_SM} aria-hidden="true" />}
                                                                </div>
                                                                <span className="text-sm font-medium">{t(child.label)}</span>
                                                            </HoverPrefetchLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <HoverPrefetchLink
                                                    href={item.href as any}
                                                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/85 hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.icon && <item.icon className={ICON_LG} aria-hidden="true" />}
                                                    <span className="nav-header">{t(item.label)}</span>
                                                </HoverPrefetchLink>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile Footer Actions ——— */}
                                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                                    {mounted && (
                                        <MobileAuthFooter
                                            getStartedLabel={t('get_started')}
                                            dashboardLabel={t('dashboard')}
                                            settingsLabel={t('settings')}
                                            iconSm={ICON_SM}
                                            onClose={() => setMobileMenuOpen(false)}
                                        />
                                    )}

                                    <button
                                        onClick={() => { toggleLocale(); setMobileMenuOpen(false); }}
                                        className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground/85 hover:text-foreground bg-muted rounded-lg border border-border transition-colors"
                                        aria-label={isRTL ? "English - Switch to English" : "العربية - Switch to Arabic"}
                                    >
                                        <Globe className={ICON_LG} aria-hidden="true" />
                                        <span>{isRTL ? "English" : "العربية"}</span>
                                    </button>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
            )}
        </>
    );
});

export default memo(function Navbar() {
    return (
        <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur-md transition-all duration-300 min-h-[64px]">
            <Suspense fallback={<div className="h-16 w-full" />}>
                <NavbarContent />
            </Suspense>
        </header>
    );
});
