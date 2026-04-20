/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";
import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import { LayoutDashboard, Zap, ShieldCheck, BarChart3, TrendingUp, Search } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Image from 'next/image';

/*
 * TBT FIX â€” FreeInsightTool imports convex/react + the generated Convex API.
 * Lazy-loading it defers that parse cost until after the hero + clients sections
 * have already rendered and the main thread is no longer in the critical path.
 */
const FreeInsightTool = dynamic(() => import('@/components/FreeInsightTool'), { ssr: false });

/**
 * HomeClient â€” Client Component containing ONLY below-the-fold, animated sections.
 *
 * LCP fix: The hero section (h1 LCP element) was extracted into `HeroSection.tsx`
 * (a Server Component) so the browser renders it instantly in static HTML without
 * waiting for this JS bundle. All framer-motion animations here only affect
 * content that is scrolled into view *after* the LCP event has already fired.
 */
export default memo(function HomeClient() {
    const t = useTranslations();

    const features = [
        {
            id: 'dashboard',
            icon: LayoutDashboard,
            color: 'from-primary to-indigo-600',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
        },
        {
            id: 'ai_agent',
            icon: Zap,
            color: 'from-purple-500 to-pink-600',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
        },
        {
            id: 'sentiment',
            icon: ShieldCheck,
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
        }
    ];

    return (
        <>
            {/* Clients Carousel Section â€” below fold, skipped during initial paint */}
            <section
                className="py-20 bg-background border-y border-border overflow-hidden"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
            >
                <div className="mb-10 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-foreground/70">{t('Clients.title')}</p>
                </div>

                <div className="relative flex overflow-x-hidden">
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="flex whitespace-nowrap gap-12 items-center"
                    >
                        {/* Double the items for seamless loop */}
                        {[...Array(2)].map((_, outerIdx) => (
                            <div key={outerIdx} className="flex gap-12 items-center">
                                {Object.keys(t.raw('Clients.list')).map((key) => (
                                    <span
                                        key={`${outerIdx}-${key}`}
                                        className="text-2xl md:text-3xl font-bold text-foreground/70 hover:text-primary transition-colors cursor-default select-none tracking-tight"
                                    >
                                        {t(`Clients.list.${key}`)}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </motion.div>

                    {/* Gradient Fades for the edges */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-primary/10 z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-primary/10 z-10"></div>
                </div>
            </section>

            {/* Trust & Compliance Row â€” images are below the fold, no priority needed */}
            <section
                className="py-12 bg-muted/30 border-b border-border"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}
            >
                <Container>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
                        {/* Use <img> for decorative trust badges â€” they are below fold, lazy by default */}
                        <div className="relative w-32 h-12">
                            <Image
                                src="/tdra.webp"
                                alt="TDRA Approved"
                                width={128}
                                height={48}
                                loading="lazy"
                                decoding="async"
                                crossOrigin="anonymous"
                                className="object-contain w-full h-full dark:brightness-110 opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <div className="relative w-16 h-16">
                            <Image
                                src="/soc2.png"
                                alt="SOC2 Compliance"
                                width={64}
                                height={64}
                                loading="lazy"
                                decoding="async"
                                crossOrigin="anonymous"
                                className="object-contain w-full h-full dark:brightness-110 opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <div className="relative w-32 h-12">
                            <Image
                                src="/secure.webp"
                                alt="Secure App"
                                width={128}
                                height={48}
                                loading="lazy"
                                decoding="async"
                                crossOrigin="anonymous"
                                className="object-contain w-full h-full dark:brightness-110 opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <div className="relative w-32 h-12">
                            <Image
                                src="/saas-awards.webp"
                                alt="SaaS Awards"
                                width={128}
                                height={48}
                                loading="lazy"
                                decoding="async"
                                crossOrigin="anonymous"
                                className="object-contain w-full h-full dark:brightness-110 opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            <FreeInsightTool />

            {/* Why Choose Us Section */}
            <section
                id="features"
                className="py-32 relative overflow-hidden bg-background"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '0 900px' }}
            >
                <Container>
                    <div className="text-center mb-24 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold text-foreground tracking-tight"
                        >
                            {t('WhyChooseUs.title')}
                        </motion.h2>
                        <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className={clsx(
                                    "relative p-10 rounded-[2.5rem] border transition-all h-full group overflow-hidden shadow-sm hover:shadow-xl",
                                    feature.border,
                                    "bg-card hover:bg-card/80"
                                )}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <feature.icon className="w-32 h-32" />
                                </div>

                                <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner", feature.bg)}>
                                    <feature.icon className="w-8 h-8 text-foreground" />
                                </div>

                                <h3 className="text-2xl font-bold text-foreground mb-6 tracking-tight">
                                    {t(`WhyChooseUs.${feature.id}.title`)}
                                </h3>

                                <p className="text-foreground/80 leading-relaxed font-light text-lg">
                                    {t(`WhyChooseUs.${feature.id}.desc`)}
                                </p>

                                {/* Mock Action/Visual per feature */}
                                {feature.id === 'dashboard' && (
                                    <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-border space-y-3">
                                        <div className="flex gap-2">
                                            <div className="h-1.5 w-1/3 bg-primary rounded-full"></div>
                                            <div className="h-1.5 w-1/2 bg-muted rounded-full"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-1.5 w-2/3 bg-primary rounded-full"></div>
                                            <div className="h-1.5 w-1/4 bg-muted rounded-full"></div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <BarChart3 className="w-4 h-4 text-primary" />
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                )}

                                {feature.id === 'ai_agent' && (
                                    <div className="mt-8 flex gap-3">
                                        <div className="px-4 py-2 bg-muted/30 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/70">{t('Common.generate_report')}</div>
                                        <div className="px-4 py-2 bg-muted/30 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/70">{t('Common.analyze_tone')}</div>
                                    </div>
                                )}

                                {feature.id === 'sentiment' && (
                                    <div className="mt-8 flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                                                    <Search className="w-3 h-3 text-foreground/60" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[85%]"></div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>
        </>
    );
});
