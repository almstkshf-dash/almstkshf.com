"use client";

import { useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown, LayoutDashboard, Search } from "lucide-react";
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
    const loginLabel = (t as any).has?.('login') ? t('login' as any) : "Sign In";

    const toggleLocale = () => {
        const newLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: newLocale });
    };

    const isRTL = locale === "ar";

    return (
        <>
            <header
                className="sticky top-0 z-[100] w-full border-b border-border bg-background transition-all duration-300"
                onMouseLeave={() => setActiveDropdown(null)}
            >
                <Container>
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo */}
                        <div onMouseEnter={() => setActiveDropdown(null)}>
                            <HoverPrefetchLink href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tighter text-foreground group z-50 relative">
                                <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-background border border-border flex items-center justify-center transition-transform group-hover:scale-105">
                                    <Image
                                        src="/logo.png"
                                        alt={tCommon('app_name')}
                                        width={48}
                                        height={48}
                                        className="object-contain p-1 invert dark:invert-0 transition-all duration-300"
                                    />
                                </div>
                                <span className="hidden xl:inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    {tCommon('app_name')}
                                </span>
                            </HoverPrefetchLink>
                        </div>

                        {/* Desktop Navigation - Hidden on tablet, visible on large screens */}
                        <nav className="hidden lg:flex items-center lg:gap-2 xl:gap-8 ms-auto lg:me-2 xl:me-8">
                            {NAVIGATION_ITEMS.map((item) => {
                                const isActive = pathname.includes(item.href || item.label);
                                const hasChildren = !!item.children;

                                if (hasChildren) {
                                    return (
                                        <div
                                            key={item.label}
                                            className="relative py-4"
                                            onMouseEnter={() => setActiveDropdown(item.label)}
                                            onFocus={() => setActiveDropdown(item.label)}
                                        >
                                            <button
                                                className={clsx(
                                                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary group",
                                                    isActive || activeDropdown === item.label ? "text-primary" : "text-muted-foreground"
                                                )}
                                                aria-expanded={activeDropdown === item.label}
                                                aria-haspopup="true"
                                            >
                                                {item.icon && (
                                                    <item.icon className={clsx(
                                                        "w-4 h-4 transition-all duration-200",
                                                        isActive || activeDropdown === item.label ? "opacity-100 scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
                                                    )} />
                                                )}
                                                <span>{t(item.label)}</span>
                                                <ChevronDown className={clsx(
                                                    "w-3.5 h-3.5 transition-transform duration-300 opacity-50",
                                                    activeDropdown === item.label && "rotate-180 opacity-100"
                                                )} />
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <HoverPrefetchLink
                                        key={item.label}
                                        href={item.href as any}
                                        className={clsx(
                                            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 group",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )}
                                        onMouseEnter={() => setActiveDropdown(null)}
                                        onFocus={() => setActiveDropdown(null)}
                                    >
                                        {item.icon && (
                                            <item.icon className={clsx(
                                                "w-4 h-4 transition-all duration-200",
                                                isActive ? "opacity-100 scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
                                            )} />
                                        )}
                                        {t(item.label)}
                                    </HoverPrefetchLink>
                                );
                            })}
                        </nav>

                        {/* Action Buttons - Visible on Desktop */}
                        <div
                            className="hidden lg:flex items-center lg:gap-2 xl:gap-4"
                            onMouseEnter={() => setActiveDropdown(null)}
                        >
                            <button
                                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted border border-border bg-muted/30 lg:px-2 xl:px-3"
                                title={t('search')}
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span className="hidden xl:flex items-center gap-1">
                                    <span className="text-[10px] border border-border px-1 rounded bg-muted/50">Ctrl</span>
                                    <span className="text-[10px] border border-border px-1 rounded bg-muted/50">K</span>
                                </span>
                                <span className="hidden xl:inline-block">{t('search')}</span>
                            </button>

                            <ThemeToggle />
                            <button
                                onClick={toggleLocale}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted border border-border lg:px-2 xl:px-3"
                                aria-label="Switch Language"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline-block">{isRTL ? "English" : "العربية"}</span>
                                <span className="xl:hidden uppercase">{locale === "en" ? "AR" : "EN"}</span>
                            </button>

                            <SignedOut>
                                <div className="flex items-center gap-2">
                                    <SignInButton mode="modal">
                                        <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 hover:bg-muted rounded-full">
                                            {loginLabel}
                                        </button>
                                    </SignInButton>
                                    <HoverPrefetchLink
                                        href="/contact"
                                        className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 lg:px-3.5 lg:py-2 xl:px-6 xl:py-2.5 whitespace-nowrap"
                                    >
                                        {t('get_started')}
                                    </HoverPrefetchLink>
                                </div>
                            </SignedOut>

                            <SignedIn>
                                <div className="flex items-center gap-3">
                                    <HoverPrefetchLink
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors border border-border/50 hover:border-border lg:px-2.5 lg:gap-1.5 xl:px-4 xl:gap-2"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="whitespace-nowrap hidden xl:inline-block">{t('dashboard')}</span>
                                    </HoverPrefetchLink>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </SignedIn>
                        </div>

                        {/* Mobile Menu Toggle - Visible on Tablet and below */}
                        <div className="lg:hidden flex items-center gap-2">
                            <ThemeToggle />
                            <button
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Menu className="w-8 h-8" />
                            </button>
                        </div>
                    </div>

                    {/* Dropdown Menu Row - Pushes content down */}
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
                                    className="py-8 border-t border-border/50"
                                    onMouseEnter={() => setActiveDropdown(activeDropdown)}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {NAVIGATION_ITEMS.find(i => i.label === activeDropdown)?.children?.map((child) => (
                                            <HoverPrefetchLink
                                                key={child.label}
                                                href={child.href as any}
                                                className="block p-4 rounded-xl hover:bg-muted/50 transition-all group/item border border-transparent hover:border-border/50 shadow-sm hover:shadow-md"
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 p-2.5 bg-muted rounded-lg group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors text-muted-foreground border border-border group-hover/item:border-primary/20">
                                                        {child.icon && <child.icon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">
                                                            {t(child.label)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed opacity-80">
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

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl lg:hidden overflow-y-auto"
                    >
                        <Container>
                            <div className="flex flex-col min-h-screen py-6">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                                    <HoverPrefetchLink href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-background border border-border flex items-center justify-center">
                                            <Image
                                                src="/logo.png"
                                                alt={tCommon('app_name')}
                                                width={40}
                                                height={40}
                                                className="object-contain invert dark:invert-0"
                                            />
                                        </div>
                                        <span className="font-bold text-xl text-foreground">
                                            {tCommon('app_name')}
                                        </span>
                                    </HoverPrefetchLink>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
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
                                                    <div className="grid grid-cols-1 gap-2 ps-4 border-s-2 border-border">
                                                        {item.children.map(child => (
                                                            <HoverPrefetchLink
                                                                key={child.label}
                                                                href={child.href as any}
                                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary transition-colors border border-border">
                                                                    {child.icon && <child.icon className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-foreground group-hover:text-primary">
                                                                        {t(child.label)}
                                                                    </div>
                                                                </div>
                                                            </HoverPrefetchLink>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <HoverPrefetchLink
                                                    href={item.href as any}
                                                    className="flex items-center gap-4 p-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <div className="p-1">
                                                        {item.icon && <item.icon className="w-6 h-6" />}
                                                    </div>
                                                    {t(item.label)}
                                                </HoverPrefetchLink>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-border flex flex-col gap-4 sticky bottom-0 bg-background pb-6">
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className="w-full p-4 text-center font-bold text-lg bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 transition-all">
                                                {t('get_started')}
                                            </button>
                                        </SignInButton>
                                    </SignedOut>

                                    <SignedIn>
                                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                                            <div className="flex items-center gap-3">
                                                <UserButton afterSignOutUrl="/" />
                                                <span className="font-bold text-foreground">Account</span>
                                            </div>
                                            <HoverPrefetchLink
                                                href="/dashboard"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <LayoutDashboard className="w-6 h-6" />
                                            </HoverPrefetchLink>
                                        </div>
                                    </SignedIn>

                                    <button
                                        onClick={() => { toggleLocale(); setMobileMenuOpen(false); }}
                                        className="flex items-center justify-center gap-3 p-4 text-muted-foreground hover:text-foreground bg-muted rounded-xl transition-all border border-border"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span className="font-medium">{isRTL ? "English" : "العربية"}</span>
                                    </button>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
