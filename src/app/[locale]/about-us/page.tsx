/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Container from '@/components/ui/Container';
import { Activity, ShieldCheck, TrendingUp, Globe, Award, Building2 } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AboutUs' });
    return {
        title: t('title'),
        description: t('subtitle'),
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/about-us`,
        },
    };
}

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AboutUs' });
    const isArabicMode = locale === 'ar';

    return (
        <main className="bg-background min-h-screen pt-32 pb-24 text-foreground overflow-hidden relative" dir={isArabicMode ? 'rtl' : 'ltr'}>
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>

            <Container>
                <div className="max-w-6xl mx-auto space-y-24 relative z-10">

                    {/* Hero Header Section */}
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-primary uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
                            {t('title')}
                        </div>
                        <h1 id="about-us-hero-title" className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight md:leading-none">
                            {t('title')}
                        </h1>
                        <p id="about-us-hero-desc" className="text-lg sm:text-xl leading-relaxed text-slate-400">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div id="about-us-stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        {[
                            {
                                icon: Activity,
                                value: t('stats.channels'),
                                desc: isArabicMode ? "رصد وبث مستمر على مدار الساعة" : "Continuous tracking across broadcast channels",
                                color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400"
                            },
                            {
                                icon: Globe,
                                value: t('stats.countries'),
                                desc: isArabicMode ? "تغطية إقليمية وعالمية شاملة" : "Comprehensive local and international coverage",
                                color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400"
                            },
                            {
                                icon: Award,
                                value: t('stats.accuracy'),
                                desc: isArabicMode ? "تحليل دقيق للنبرة والمشاعر" : "Precise sentiment and tone intelligence",
                                color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
                            }
                        ].map((stat, idx) => (
                            <div key={idx} className="p-8 rounded-[30px] bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
                                <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{stat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Story & Mission & Vision Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                        {/* Company Story Panel */}
                        <div id="about-us-story-panel" className="p-10 md:p-12 rounded-[40px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 blur-3xl opacity-50"></div>
                            <div className="space-y-6 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">{t('story_title')}</h2>
                                <p className="text-slate-400 text-base leading-relaxed">{t('story_desc')}</p>
                            </div>
                            <div className="pt-8 border-t border-slate-800/50 mt-8 relative z-10">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                                    {isArabicMode ? "فخر الصناعة الإماراتية الذكية" : "Proudly Engineered in the UAE"}
                                </p>
                            </div>
                        </div>

                        {/* Mission & Vision Panel */}
                        <div className="flex flex-col gap-8 justify-between">
                            {/* Mission Panel */}
                            <div id="about-us-mission-panel" className="p-8 rounded-[30px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex gap-6 relative group overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">{t('mission_title')}</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed">{t('mission_desc')}</p>
                                </div>
                            </div>

                            {/* Vision Panel */}
                            <div id="about-us-vision-panel" className="p-8 rounded-[30px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex gap-6 relative group overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">{t('vision_title')}</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed">{t('vision_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Capabilities & Core Features */}
                    <div className="space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 id="about-us-capabilities-title" className="text-3xl font-bold text-white tracking-tight">{t('features_title')}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {isArabicMode
                                    ? "مجموعة حلول متكاملة تضمن دقة وسرعة الاستجابة وصناعة القرار مع الالتزام التام بالمعايير القانونية والأمنية."
                                    : "Comprehensive suit of modules ensuring prompt response, strategic decision support, and absolute regulatory compliance."}
                            </p>
                        </div>

                        <div id="about-us-capabilities-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Activity,
                                    title: t('features.monitoring'),
                                    desc: t('features.monitoring_desc'),
                                    color: "group-hover:text-blue-400"
                                },
                                {
                                    icon: ShieldCheck,
                                    title: t('features.compliance'),
                                    desc: t('features.compliance_desc'),
                                    color: "group-hover:text-purple-400"
                                },
                                {
                                    icon: TrendingUp,
                                    title: t('features.analytics'),
                                    desc: t('features.analytics_desc'),
                                    color: "group-hover:text-emerald-400"
                                }
                            ].map((feat, idx) => (
                                <div key={idx} className="p-8 rounded-[30px] bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group overflow-hidden relative">
                                    <div className="space-y-4">
                                        <feat.icon className={`w-8 h-8 text-slate-500 transition-colors duration-300 ${feat.color}`} />
                                        <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </Container>
        </main>
    );
}
