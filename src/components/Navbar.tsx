"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown, LayoutDashboard, Search, Settings } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import Container from "@/components/ui/Container";
import Image from "next/image";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HoverPrefetchLink } from "@/components/ui/HoverPrefetchLink";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
    const t = useTranslations("Navigation");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const loginLabel = (t as any).has?.('login') ? t('login' as any) : "Sign In";

    const toggleLocale = () => {
        const newLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: newLocale });
    };

    const isRTL = locale === "ar";

    /* ──────────────────────────────────────────────── */
    /* Shared icon size tokens                          */
    /* ──────────────────────────────────────────────── */
    const ICON_SM = "w-4 h-4";
    const ICON_MD = "w-[18px] h-[18px]";
    const ICON_LG = "w-5 h-5";
    const ACTION_BTN = "w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center";

    return (
        <>
            <header
                className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur-md transition-all duration-300"
                onMouseLeave={() => setActiveDropdown(null)}
            >
                <Container>
                    <div className="flex h-16 items-center justify-between gap-4">

                        {/* ─── Logo ─── */}
                        <div onMouseEnter={() => setActiveDropdown(null)} className="shrink-0">
                            <HoverPrefetchLink href="/" aria-label={`${tCommon('app_name')} - Go to homepage`} className="flex items-center gap-2.5 group z-50 relative">
                                <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-border bg-background flex items-center justify-center transition-transform group-hover:scale-105">
                                    <Image
                                        src="/logo.png"
                                        alt={tCommon('app_name')}
                                        width={32}
                                        height={32}
                                        className="object-contain dark:brightness-0 dark:invert"
                                        priority
                                    />
                                </div>
                                <span className="hidden sm:block font-bold text-lg tracking-tight text-foreground">
                                    {tCommon('app_name')}
                                </span>
                            </HoverPrefetchLink>
                        </div>

                        {/* ─── Desktop Navigation ─── */}
                        <nav className="hidden lg:flex items-center gap-1 mx-auto">
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
                                                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                    isActive || activeDropdown === item.label
                                                        ? "text-primary bg-primary/5"
                                                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                                                )}
                                                aria-expanded={activeDropdown === item.label}
                                                aria-haspopup="true"
                                            >
                                                {item.icon && (
                                                    <item.icon className={clsx(ICON_MD, "shrink-0")} aria-hidden="true" />
                                                )}
                                                <span>{t(item.label)}</span>
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
                                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "text-primary bg-primary/5"
                                                : "text-foreground/70 hover:text-foreground hover:bg-muted"
                                        )}
                                        onMouseEnter={() => setActiveDropdown(null)}
                                        onFocus={() => setActiveDropdown(null)}
                                    >
                                        {item.icon && (
                                            <item.icon className={clsx(ICON_MD, "shrink-0")} aria-hidden="true" />
                                        )}
                                        {t(item.label)}
                                    </HoverPrefetchLink>
                                );
                            })}
                        </nav>

                        {/* ─── Action Buttons (Desktop) ─── */}
                        <div
                            className="hidden lg:flex items-center gap-2 shrink-0"
                            onMouseEnter={() => setActiveDropdown(null)}
                        >
                            {/* Search */}
                            <button
                                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                                className={clsx(ACTION_BTN, "gap-1.5 w-auto px-3")}
                                aria-label={t('search')}
                            >
                                <Search className={ICON_SM} aria-hidden="true" />
                                <span className="hidden xl:flex items-center gap-1 text-xs text-foreground/70">
                                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] leading-none">⌘</kbd>
                                    <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] leading-none">K</kbd>
                                </span>
                            </button>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Language Toggle */}
                            <button
                                onClick={toggleLocale}
                                className={ACTION_BTN}
                                aria-label={isRTL ? "Switch to English" : "Switch to Arabic"}
                            >
                                <Globe className={ICON_LG} aria-hidden="true" />
                            </button>

                            {/* Auth section - ALWAYS visible */}
                            {mounted && (
                                <>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                                                {loginLabel}
                                            </button>
                                        </SignInButton>
                                        <HoverPrefetchLink
                                            href="/contact"
                                            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all whitespace-nowrap"
                                        >
                                            {t('get_started')}
                                        </HoverPrefetchLink>
                                    </SignedOut>

                                    <SignedIn>
                                        <HoverPrefetchLink
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                        >
                                            <LayoutDashboard className={ICON_SM} aria-hidden="true" />
                                            <span className="whitespace-nowrap">{t('dashboard')}</span>
                                        </HoverPrefetchLink>
                                        <HoverPrefetchLink
                                            href="/dashboard/settings"
                                            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                                        >
                                            <Settings className={ICON_SM} aria-hidden="true" />
                                            <span className="whitespace-nowrap">{t('settings')}</span>
                                        </HoverPrefetchLink>
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    userButtonAvatarBox: "w-9 h-9 border-2 border-border hover:border-primary transition-colors",
                                                    userButtonTrigger: "focus:shadow-none focus:outline-none"
                                                }
                                            }}
                                        />
                                    </SignedIn>
                                </>
                            )}

                            {/* Fallback while Clerk loads or if not signed in  */}
                            {!mounted && (
                                <div className={clsx(ACTION_BTN, "animate-pulse bg-muted")} aria-hidden="true" />
                            )}
                        </div>

                        {/* ─── Mobile Controls ─── */}
                        <div className="lg:hidden flex items-center gap-2 shrink-0">
                            {/* Dashboard link - ALWAYS visible on mobile when signed in */}
                            {mounted && (
                                <SignedIn>
                                    <HoverPrefetchLink
                                        href="/dashboard"
                                        className={clsx(ACTION_BTN, "text-primary")}
                                        aria-label={t('dashboard')}
                                    >
                                        <LayoutDashboard className={ICON_SM} aria-hidden="true" />
                                    </HoverPrefetchLink>
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: "w-9 h-9 border border-border",
                                                userButtonTrigger: "focus:shadow-none focus:outline-none"
                                            }
                                        }}
                                    />
                                </SignedIn>
                            )}

                            <ThemeToggle />

                            <button
                                className={clsx(ACTION_BTN, "text-foreground")}
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <Menu className={ICON_LG} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* ─── Dropdown Menu ─── */}
                    <AnimatePresence>
                        {activeDropdown && NAVIGATION_ITEMS.find(i => i.label === activeDropdown)?.children && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="overflow-hidden"
                            >
                                <div
                                    className="py-6 border-t border-border"
                                    onMouseEnter={() => setActiveDropdown(activeDropdown)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {NAVIGATION_ITEMS.find(i => i.label === activeDropdown)?.children?.map((child) => (
                                            <HoverPrefetchLink
                                                key={child.label}
                                                href={child.href as any}
                                                className="block p-4 rounded-xl hover:bg-muted transition-all group/item border border-transparent hover:border-border"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 p-2 bg-muted rounded-lg group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors text-foreground/60 border border-border group-hover/item:border-primary/20">
                                                        {child.icon && <child.icon className={ICON_LG} aria-hidden="true" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">
                                                            {t(child.label)}
                                                        </div>
                                                        <div className="text-xs text-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                                                            {t(`${child.label}_desc` as any)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </HoverPrefetchLink>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Container>
            </header>

            {/* ─── Mobile Menu Overlay ─── */}
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
                                                alt={tCommon('app_name')}
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
                                                    <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider px-3 py-2">
                                                        {t(item.label)}
                                                    </div>
                                                    <div className="space-y-0.5 ps-3 border-s-2 border-border ms-3">
                                                        {item.children.map(child => (
                                                            <HoverPrefetchLink
                                                                key={child.label}
                                                                href={child.href as any}
                                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <div className="p-1.5 bg-muted rounded-md border border-border text-foreground/50" aria-hidden="true">
                                                                    {child.icon && <child.icon className={ICON_SM} />}
                                                                </div>
                                                                <span className="text-sm font-medium">{t(child.label)}</span>
                                                            </HoverPrefetchLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <HoverPrefetchLink
                                                    href={item.href as any}
                                                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.icon && <item.icon className={ICON_LG} aria-hidden="true" />}
                                                    {t(item.label)}
                                                </HoverPrefetchLink>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile Footer Actions */}
                                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                                    {mounted && (
                                        <>
                                            <SignedOut>
                                                <SignInButton mode="modal">
                                                    <button className="w-full py-3 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                                        {t('get_started')}
                                                    </button>
                                                </SignInButton>
                                            </SignedOut>

                                            <SignedIn>
                                                <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                                                    <div className="flex items-center justify-between p-2">
                                                        <div className="flex items-center gap-3">
                                                            <UserButton afterSignOutUrl="/" />
                                                            <span className="font-medium text-foreground text-sm">Account</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <HoverPrefetchLink
                                                            href="/dashboard"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                                                        >
                                                            <LayoutDashboard className={ICON_SM} aria-hidden="true" />
                                                            <span>{t('dashboard')}</span>
                                                        </HoverPrefetchLink>
                                                        <HoverPrefetchLink
                                                            href="/dashboard/settings"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-border"
                                                        >
                                                            <Settings className={ICON_SM} aria-hidden="true" />
                                                            <span>{t('settings')}</span>
                                                        </HoverPrefetchLink>
                                                    </div>
                                                </div>
                                            </SignedIn>
                                        </>
                                    )}

                                    <button
                                        onClick={() => { toggleLocale(); setMobileMenuOpen(false); }}
                                        className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground/70 hover:text-foreground bg-muted rounded-lg border border-border transition-colors"
                                        aria-label={isRTL ? "Switch to English" : "Switch to Arabic"}
                                    >
                                        <Globe className={ICON_LG} aria-hidden="true" />
                                        <span>{isRTL ? "English" : "العربية"}</span>
                                    </button>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
}