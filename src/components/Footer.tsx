/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useTranslations } from "next-intl";
import Container from "./ui/Container";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Linkedin, Mail, Phone, MapPin } from "lucide-react";

const LINK_STYLE = "text-muted-foreground hover:text-foreground transition-colors text-sm";
const NAV_LINK_STYLE = `${LINK_STYLE} flex items-center gap-2 group`;

const COMPANY_INFO = {
    phone: "+971 58 59 52 035",
    phoneRaw: "+971585952035",
    email: "k.account@almstkshf.com",
    linkedin: "https://www.linkedin.com/company/almstkshf/"
};

type NavigationLinkKey =
    | "landing_page"
    | "about_us"
    | "pricing"
    | "lexcora"
    | "contact"
    | "faq";

interface FooterLinkItem {
    labelKey: NavigationLinkKey;
    href: string;
}

const QUICK_LINKS: FooterLinkItem[] = [
    { labelKey: "landing_page", href: "/" },
    { labelKey: "about_us", href: "/about-us" },
    { labelKey: "pricing", href: "/pricing" },
    { labelKey: "lexcora", href: "/case-studies/lexcora" },
    { labelKey: "contact", href: "/contact" },
    { labelKey: "faq", href: "/case-studies/lexcora#faq" }
];

function FooterBullet() {
    return (
        <span 
            className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" 
            aria-hidden="true" 
        />
    );
}

interface FooterSectionProps {
    title: string;
    children: React.ReactNode;
    id: string;
    isNav?: boolean;
}

function FooterSection({ title, children, id, isNav = false }: FooterSectionProps) {
    const headingElement = (
        <h3 id={id} className="text-foreground font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2 section-title">
            <span className="w-8 h-px bg-primary" aria-hidden="true"></span>
            {title}
        </h3>
    );

    if (isNav) {
        return (
            <nav aria-labelledby={id} className="space-y-6">
                {headingElement}
                {children}
            </nav>
        );
    }

    return (
        <div className="space-y-6">
            {headingElement}
            {children}
        </div>
    );
}

export default function Footer() {
    const t = useTranslations("Footer");
    const tNav = useTranslations("Navigation");
    const tCommon = useTranslations("Common");

    return (
        <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-300">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent app-name">
                                {tCommon('app_name')}
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            {t('description')}
                        </p>
                        <div className="flex gap-4">
                            <a 
                                href={COMPANY_INFO.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer me" 
                                aria-label="LinkedIn" 
                                className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all"
                            >
                                <Linkedin className="w-5 h-5" aria-hidden="true" />
                            </a>
                        </div>
                        <div className="pt-4 flex flex-wrap gap-4">
                            <div className="relative w-20 h-8">
                                <Image src="/tdra.webp" alt={tCommon('tdra_alt')} fill sizes="(max-width: 768px) 80px, 80px" className="object-contain invert dark:invert-0 dark:brightness-110" />
                            </div>
                            <div className="relative w-8 h-8">
                                <Image src="/soc2.png" alt={tCommon('soc2_alt')} fill sizes="(max-width: 768px) 32px, 32px" className="object-contain invert dark:invert-0 dark:brightness-110" />
                            </div>
                            <div className="relative w-20 h-8">
                                <Image src="/secure.webp" alt={tCommon('secure_alt')} fill sizes="(max-width: 768px) 80px, 80px" className="object-contain invert dark:invert-0 dark:brightness-110" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <FooterSection title={t('links')} id="footer-quick-links-title" isNav>
                        <ul className="space-y-4">
                            {QUICK_LINKS.map((item) => (
                                <li key={item.labelKey}>
                                    <Link
                                        href={item.href}
                                        className={NAV_LINK_STYLE}
                                    >
                                        <FooterBullet />
                                        {tNav(item.labelKey)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </FooterSection>

                    {/* Column 3: Contact Info */}
                    <FooterSection title={tCommon('try_ai')} id="footer-contact-title">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors">
                                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <address className="not-italic">
                                    {t('address_dubai')}<br />{t('address_abu_dhabi')}
                                </address>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors">
                                <Phone className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="hover:text-primary transition-colors">
                                    {COMPANY_INFO.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors">
                                <Mail className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-primary transition-colors">
                                    {COMPANY_INFO.email}
                                </a>
                            </li>
                        </ul>
                    </FooterSection>

                    {/* Column 4: Newsletter/Legal */}
                    <FooterSection title={t('legal')} id="footer-legal-title" isNav>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy" className={LINK_STYLE}>
                                    {t('privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className={LINK_STYLE}>
                                    {t('terms')}
                                </Link>
                            </li>
                        </ul>

                        {/* Domain Switcher Placeholder */}
                        <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
                            <p className="text-xs text-muted-foreground mb-3 uppercase font-bold tracking-widest">{t('global_network')}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-muted text-[10px] text-foreground rounded font-medium border border-border">{t('regions.uae')}</span>
                                <span className="px-2 py-1 bg-muted text-[10px] text-foreground rounded font-medium border border-border">{t('regions.ksa')} ({t('coming_soon')})</span>
                            </div>
                        </div>
                    </FooterSection>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    <p>© {new Date().getFullYear()} {tCommon('app_name')}. {t('rights')}.</p>
                    <div className="flex gap-6">
                        <Link href="/contact" className="hover:text-foreground transition-colors">{t('support')}</Link>
                        <a href="/sitemap.xml" className="hover:text-foreground transition-colors">{t('sitemap')}</a>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
