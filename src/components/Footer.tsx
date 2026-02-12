"use client";

import { useTranslations, useLocale } from "next-intl";
import Container from "./ui/Container";
import Link from "next/link";
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
                            <Link href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Instagram className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="w-8 h-px bg-blue-500"></span>
                            {t('links')}
                        </h4>
                        <ul className="space-y-4">
                            {NAVIGATION_ITEMS.filter(item => !item.children).map((item) => (
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
                            {/* Static links if needed */}
                            <li>
                                <Link
                                    href={`/${locale}/case-studies/lexcura-lawyer`}
                                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                                    {tNav('lexcura_lawyer')}
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
                                <span>Dubai, United Arab Emirates<br />Business Bay, AI District</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm hover:text-white transition-colors group">
                                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>+971 (4) 000-0000</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm hover:text-white transition-colors group">
                                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>contact@almstkshf.com</span>
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
                            <p className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-widest">Global Network</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-300 rounded font-medium border border-slate-700">UAE</span>
                                <span className="px-2 py-1 bg-slate-800 text-[10px] text-slate-500 rounded font-medium border border-slate-700/50 opacity-50">KSA (Coming Soon)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
                    <p>© {new Date().getFullYear()} {tCommon('app_name')}. {t('rights')}.</p>
                    <div className="flex gap-6">
                        <button className="hover:text-white transition-colors">Security</button>
                        <button className="hover:text-white transition-colors">Sitemap</button>
                        <button className="hover:text-white transition-colors">Status</button>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
