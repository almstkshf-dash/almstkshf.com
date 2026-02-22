"use client";

import { useTranslations, useLocale } from "next-intl";
import Container from "./ui/Container";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import Button from "./ui/Button";

export default function Footer() {
    const t = useTranslations("Footer");
    const tNav = useTranslations("Navigation");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const isRTL = locale === "ar";

    return (
        <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-300">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {tCommon('app_name')}
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            {t('description')}
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.linkedin.com/company/almstkshf/" target="_blank" aria-label="LinkedIn" className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all">
                                <Linkedin className="w-5 h-5" aria-hidden="true" />
                            </Link>
                        </div>
                        <div className="pt-4 flex flex-wrap gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="relative w-20 h-8">
                                <Image src="/tdra.png" alt="TDRA Certification" fill sizes="(max-width: 768px) 80px, 80px" className="object-contain dark:brightness-110" />
                            </div>
                            <div className="relative w-8 h-8">
                                <Image src="/soc2.png" alt="SOC2 Compliance" fill sizes="(max-width: 768px) 32px, 32px" className="object-contain dark:brightness-110" />
                            </div>
                            <div className="relative w-20 h-8">
                                <Image src="/secure.png" alt="Secure Application" fill sizes="(max-width: 768px) 80px, 80px" className="object-contain dark:brightness-110" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-primary" aria-hidden="true"></span>
                            {t('links')}
                        </h3>
                        <ul className="space-y-4">
                            {/* Filter out items that are already top-level or have children, 
                                and ensure we don't duplicate items that are explicitly listed below */}
                            {NAVIGATION_ITEMS.filter(item => !item.children && !['lexcora', 'contact', 'faq'].includes(item.label)).map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href as any}
                                        className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span>
                                        {tNav(item.label)}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/case-studies/lexcora"
                                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span>
                                    {tNav('lexcora')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span>
                                    {tNav('contact')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/case-studies/lexcora#faq"
                                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors"></span>
                                    {tNav('faq')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-primary" aria-hidden="true"></span>
                            {tCommon('try_ai')}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors group cursor-pointer">
                                <MapPin className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <span>{t('address_dubai')}<br />{t('address_abu_dhabi')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors group">
                                <Phone className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <span>+971 58 59 52 035</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground transition-colors group">
                                <Mail className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                                <span>k.account@almstkshf.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter/Legal */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-primary" aria-hidden="true"></span>
                            {t('legal')}
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                    {t('privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                                    {t('terms')}
                                </Link>
                            </li>
                        </ul>

                        {/* Domain Switcher Placeholder */}
                        <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
                            <p className="text-xs text-muted-foreground mb-3 uppercase font-bold tracking-widest">{t('global_network')}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-muted text-[10px] text-foreground rounded font-medium border border-border">{t('regions.uae')}</span>
                                <span className="px-2 py-1 bg-muted text-[10px] text-muted-foreground/80 rounded font-medium border border-border">{t('regions.ksa')} ({t('coming_soon')})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    <p>© {new Date().getFullYear()} {tCommon('app_name')}. {t('rights')}.</p>
                    <div className="flex gap-6">
                        <Link href="/contact" className="hover:text-foreground transition-colors">{t('support')}</Link>
                        <a href="/sitemap.xml" className="hover:text-foreground transition-colors">{t('sitemap')}</a>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-foreground h-auto p-0 font-medium uppercase tracking-widest text-[11px] shadow-none hover:bg-transparent"
                        >
                            {t('status')}
                        </Button>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
