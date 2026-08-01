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
import { 
    AnimatedHeroHeader, 
    AnimatedStatsGrid, 
    AnimatedStoryPanel, 
    AnimatedMissionVision, 
    AnimatedCapabilitiesGrid,
    StatItemInput,
    FeatureItemInput
} from '@/components/AnimatedAboutCards';

// Point 1: Static Arrays Externalization (Defined outside component body to avoid allocation overhead on render)
const STATS_STRUCTURE = [
    {
        key: 'channels' as const,
        color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400"
    },
    {
        key: 'countries' as const,
        color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400"
    },
    {
        key: 'accuracy' as const,
        color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
    }
];

const FEATURES_STRUCTURE = [
    {
        key: 'monitoring' as const,
        color: "group-hover:text-blue-400"
    },
    {
        key: 'compliance' as const,
        color: "group-hover:text-purple-400"
    },
    {
        key: 'analytics' as const,
        color: "group-hover:text-emerald-400"
    }
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "من نحن — شركة رصد إعلامي رائدة في الإمارات والسعودية"
            : "About Us — Leading Media Monitoring Company in UAE & Saudi Arabia",
        description: isAr
            ? "تعرف على المستكشف — شركة تكنولوجيا إعلامية متخصصة في الرصد الإعلامي وتحليل مشاعر الرأي العام بالذكاء الاصطناعي. مقرنا في دبي وأبوظبي ونخدم المؤسسات في الإمارات والسعودية والخليج."
            : "Learn about ALMSTKSHF — a media technology company specializing in media monitoring and AI-powered sentiment analysis. Headquartered in Dubai and Abu Dhabi, serving enterprises across the UAE, Saudi Arabia, and the Gulf.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/about-us`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/about-us',
                en: 'https://www.almstkshf.com/en/about-us',
                ar: 'https://www.almstkshf.com/ar/about-us',
            }
        },
    };
}

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'AboutUs' });
    const isArabicMode = locale === 'ar';

    // Point 3: Mapping fully decoupled and externalized localized text content
    const stats: StatItemInput[] = STATS_STRUCTURE.map((item) => ({
        key: item.key,
        value: t(`stats.${item.key}`),
        desc: t(`stats.${item.key}_desc`),
        color: item.color
    }));

    const features: FeatureItemInput[] = FEATURES_STRUCTURE.map((item) => ({
        key: item.key,
        title: t(`features.${item.key}`),
        desc: t(`features.${item.key}_desc`),
        color: item.color
    }));

    const mission = {
        title: t('mission_title'),
        desc: t('mission_desc')
    };

    const vision = {
        title: t('vision_title'),
        desc: t('vision_desc')
    };

    const story = {
        title: t('story_title'),
        desc: t('story_desc'),
        footer: t('story_footer')
    };

    return (
        <main className="bg-background min-h-screen pt-32 pb-24 text-foreground overflow-hidden relative" dir={isArabicMode ? 'rtl' : 'ltr'}>
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>

            <Container>
                <div className="max-w-6xl mx-auto space-y-24 relative z-10">

                    {/* Point 2: Hero Header Section with subtle entrance animation */}
                    <AnimatedHeroHeader 
                        badge={t('title')} 
                        title={t('title')} 
                        subtitle={t('subtitle')} 
                    />

                    {/* Point 2: Staggered animation for Stats Grid */}
                    <AnimatedStatsGrid stats={stats} />

                    {/* Story & Mission & Vision Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                        {/* Point 2: Company Story Panel animation */}
                        <AnimatedStoryPanel 
                            title={story.title} 
                            desc={story.desc} 
                            footer={story.footer} 
                        />

                        {/* Point 2: Mission & Vision Panel animations */}
                        <AnimatedMissionVision 
                            mission={mission} 
                            vision={vision} 
                        />
                    </div>

                    {/* Capabilities & Core Features */}
                    <div className="space-y-12">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <h2 id="about-us-capabilities-title" className="text-3xl font-bold text-foreground tracking-tight">{t('features_title')}</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {t('features_desc')}
                            </p>
                        </div>

                        {/* Point 2: Capabilities/Features cards animation */}
                        <AnimatedCapabilitiesGrid features={features} />
                    </div>

                </div>
            </Container>
        </main>
    );
}
