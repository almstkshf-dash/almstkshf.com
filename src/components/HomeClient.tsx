"use client";
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { LayoutDashboard, Zap, ShieldCheck, BarChart3, TrendingUp, Search } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import FreeInsightTool from '@/components/FreeInsightTool';

export default function HomeClient() {
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
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            id: 'sentiment',
            icon: ShieldCheck,
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        }
    ];

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center text-foreground overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/10 via-transparent to-background blur-3xl opacity-50"></div>

                <div className="z-10 text-center max-w-4xl px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-9xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-accent inline-block"
                    >
                        {t('Common.app_name')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-lg md:text-2xl font-medium text-primary mb-8 uppercase tracking-[0.3em]"
                    >
                        {t('Common.slogan')}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light"
                    >
                        {t('Common.description')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <Link
                            href="https://chatgpt.com/g/g-68297975a3548191a8530cb64b22aaa3-almstkshf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30 flex items-center gap-3 group"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            {t('Common.try_ai')}
                        </Link>

                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-card/50 border border-border backdrop-blur-xl hover:border-primary text-muted-foreground rounded-2xl font-semibold transition-all hover:text-foreground"
                        >
                            {t('Common.view_details')}
                        </button>
                    </motion.div>
                </div>

                {/* Animated Background Element */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="absolute bottom-0 left-0 right-0 h-[300px] border-t border-primary/20 bg-gradient-to-t from-primary/5 to-transparent"
                ></motion.div>
            </section>

            {/* Clients Carousel Section */}
            <section className="py-20 bg-background border-y border-border overflow-hidden">
                <div className="mb-10 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('Clients.title')}</p>
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
                                        className="text-2xl md:text-3xl font-bold text-muted-foreground hover:text-primary/50 transition-colors cursor-default select-none tracking-tight"
                                    >
                                        {t(`Clients.list.${key}`)}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </motion.div>

                    {/* Gradient Fades for the edges */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
                </div>
            </section>

            {/* Trust & Compliance Row */}
            <section className="py-12 bg-muted/10 border-b border-border">
                <Container>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
                        <div className="relative w-32 h-12">
                            <Image src="/tdra.png" alt="TDRA Approved" fill className="object-contain" />
                        </div>
                        <div className="relative w-16 h-16">
                            <Image src="/soc2.png" alt="SOC2 Compliance" fill className="object-contain" />
                        </div>
                        <div className="relative w-32 h-12">
                            <Image src="/secure.png" alt="Secure App" fill className="object-contain" />
                        </div>
                        <div className="relative w-32 h-12">
                            <Image src="/saas-awards.webp" alt="SaaS Awards" fill className="object-contain" />
                        </div>
                    </div>
                </Container>
            </section>

            <FreeInsightTool />

            {/* Why Choose Us Section */}
            <section id="features" className="py-32 relative overflow-hidden bg-background">
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
                                    "relative p-10 rounded-[2.5rem] border transition-all h-full group overflow-hidden",
                                    feature.border,
                                    "bg-card/30 hover:bg-card/50 backdrop-blur-2xl"
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

                                <p className="text-muted-foreground leading-relaxed font-light text-lg">
                                    {t(`WhyChooseUs.${feature.id}.desc`)}
                                </p>

                                {/* Mock Action/Visual per feature */}
                                {feature.id === 'dashboard' && (
                                    <div className="mt-8 p-4 bg-background/50 rounded-2xl border border-border space-y-3">
                                        <div className="flex gap-2">
                                            <div className="h-1.5 w-1/3 bg-primary rounded-full"></div>
                                            <div className="h-1.5 w-1/2 bg-muted rounded-full"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-1.5 w-2/3 bg-indigo-500 rounded-full"></div>
                                            <div className="h-1.5 w-1/4 bg-muted rounded-full"></div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <BarChart3 className="w-4 h-4 text-primary" />
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                )}

                                {feature.id === 'ai_agent' && (
                                    <div className="mt-8 flex gap-3">
                                        <div className="px-4 py-2 bg-background/50 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('Common.generate_report')}</div>
                                        <div className="px-4 py-2 bg-background/50 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('Common.analyze_tone')}</div>
                                    </div>
                                )}

                                {feature.id === 'sentiment' && (
                                    <div className="mt-8 flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                                                    <Search className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[85%]"></div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>
        </main>
    );
}
