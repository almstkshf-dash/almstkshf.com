"use client";

import { useTranslations, useLocale } from "next-intl";
import Container from "./ui/Container";
import Link from "next/link";
import Image from "next/image";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const t = useTranslations("Footer");
    const tNav = useTranslations("Navigation");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const isRTL = locale === "ar";

    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <Link href={`/${locale}`} className="flex items-center gap-3">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                                {tCommon('app_name')}
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            {t('description')}
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.linkedin.com/company/almstkshf/" target="_blank" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="pt-4 flex flex-wrap gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="relative w-20 h-8">
                                <Image src="/tdra.png" alt="TDRA" fill className="object-contain" />
                            </div>
                            <div className="relative w-8 h-8">
                                <Image src="/soc2.png" alt="SOC2" fill className="object-contain" />
                            </div>
                            <div className="relative w-20 h-8">
                                <Image src="/secure.png" alt="Secure App" fill className="object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-blue-500"></span>
                            {t('links')}
                        </h4>
                        <ul className="space-y-4">
                            {/* Filter out items that are already top-level or have children, 
                                and ensure we don't duplicate items that are explicitly listed below */}
                            {NAVIGATION_ITEMS.filter(item => !item.children && !['lexcora', 'contact', 'faq'].includes(item.label)).map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={`/${locale}${item.href}`}
                                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                                        {tNav(item.label)}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href={`/${locale}/case-studies/lexcora`}
                                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                                    {tNav('lexcora')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                                    {tNav('contact')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/case-studies/lexcora#faq`}
                                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                                    {tNav('faq')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-blue-500"></span>
                            {tCommon('try_ai')}
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-400 text-sm hover:text-white transition-colors group cursor-pointer">
                                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>{t('address_dubai')}<br />{t('address_abu_dhabi')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm hover:text-white transition-colors group">
                                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>+971 58 59 52 035</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm hover:text-white transition-colors group">
                                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>k.account@almstkshf.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter/Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-blue-500"></span>
                            {t('legal')}
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                                    {t('privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                                    {t('terms')}
                                </Link>
                            </li>
                        </ul>

                        {/* Domain Switcher Placeholder */}
                        <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-widest">{t('global_network')}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-300 rounded font-medium border border-slate-700">UAE</span>
                                <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-500 rounded font-medium border border-slate-700/50 opacity-50">KSA ({t('coming_soon')})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
                    <p>© {new Date().getFullYear()} {tCommon('app_name')}. {t('rights')}.</p>
                    <div className="flex gap-6">
                        <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('support')}</Link>
                        <Link href="/sitemap.xml" className="hover:text-white transition-colors">{t('sitemap')}</Link>
                        <button className="hover:text-white transition-colors">{t('status')}</button>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
