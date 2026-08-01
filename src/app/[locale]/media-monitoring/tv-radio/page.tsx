/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from "next";
import TvRadioClient from "@/components/TvRadioClient";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "رصد البث التلفزيوني والإذاعي في الإمارات والسعودية والخليج"
            : "TV & Radio Broadcast Monitoring — UAE, Saudi Arabia & Gulf",
        description: isAr
            ? "تتبع ورصد فوري لأكثر من 3400 قناة بث تلفزيوني وإذاعي محلي وعالمي. رصد القنوات الإماراتية والسعودية والخليجية مع تحليل المحتوى وأرشفة البث بالذكاء الاصطناعي."
            : "Real-time tracking and monitoring of over 3,400 local and global TV and radio broadcast channels. Monitor UAE, Saudi and Gulf channels with AI content analysis and broadcast archiving.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/tv-radio`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/media-monitoring/tv-radio',
                en: 'https://www.almstkshf.com/en/media-monitoring/tv-radio',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/tv-radio',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function TvRadioPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";
    let initialReports: any[] = [];
    let initialCrisisPlans: any[] = [];

    try {
        const [rawArticles, crisisPlans] = await Promise.all([
            prisma.mediaMonitoringArticle.findMany({
                take: 50,
                orderBy: { createdAt: "desc" }
            }),
            prisma.crisisPlan.findMany()
        ]);
        initialReports = rawArticles.map((a: any) => ({
            ...a,
            createdAt: Number(a.createdAt),
            status: "Published"
        }));
        initialCrisisPlans = crisisPlans;
    } catch (e) {
        console.error("Server query error on TvRadioPage:", e);
    }

    const title = isAr
        ? "رصد البث التلفزيوني والإذاعي بالذكاء الاصطناعي في الإمارات والسعودية"
        : "AI TV & Radio Broadcast Monitoring in UAE & Saudi Arabia";

    const description = isAr
        ? "تتبع ورصد فوري لأكثر من 3400 قناة بث تلفزيوني وإذاعي محلي وعالمي. المستكشف يوفر للمؤسسات الحكومية والشركات في الإمارات والسعودية والخليج تحويلاً آلياً للصوت إلى نصوص، وتحليل نبرة البث، وتنبيهات فورية للتغطيات الإعلامية."
        : "Real-time tracking and monitoring of over 3,400 local and global TV and radio broadcast channels. ALMSTKSHF provides government entities and enterprises across the UAE, Saudi Arabia, and the Gulf with automated speech-to-text, broadcast tone analysis, and instant coverage alerts.";

    const url = `https://www.almstkshf.com/${locale}/media-monitoring/tv-radio`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الرصد الإعلامي" : "Media Monitoring", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "رصد البث التلفزيوني والإذاعي" : "TV & Radio Monitoring", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "رصد البث التلفزيوني والإذاعي" : "Broadcast Media Monitoring"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["رصد القنوات الفضائية والإذاعية", "تحويل الصوت إلى نص بالذكاء الاصطناعي", "تحليل مشاعر التغطيات المرئية", "أرشيف البث الرقمي"]
                        : ["Satellite & Radio Monitoring", "AI Speech-to-Text Transcription", "Broadcast Sentiment Analysis", "Digital Broadcast Archive"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

import ServiceSeoHeader from "@/components/ServiceSeoHeader";

            <ServiceSeoHeader
                badge={isAr ? "رصد البث التلفزيوني والإذاعي" : "TV & Radio Broadcast Monitoring"}
                title={isAr ? "رصد التلفزيون والإذاعة بالذكاء الاصطناعي في" : "AI Broadcast Monitoring Across"}
                titleHighlight={isAr ? "الإمارات والسعودية والخليج" : "UAE, Saudi Arabia & the Gulf"}
                description={description}
                metrics={[
                    { label: isAr ? "قناة بث مباشرة" : "Live Channels", value: "+3,400" },
                    { label: isAr ? "دقة تحويل الصوت" : "Speech-to-Text Accuracy", value: "99.4%" },
                    { label: isAr ? "تنبيه التغطيات" : "Alert Response", value: "< 3s" },
                    { label: isAr ? "تغطية دولية" : "Regional Coverage", value: "24/7" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "رصد البث الفضائي", desc: "تتبع وتفريغ آلي لأكثر من 3400 قناة فضائية وإذاعية إقليمية ودولية." },
                            { title: "تحويل الصوت لنص", desc: "تقنيات الذكاء الاصطناعي لتحويل المحتوى الصوتي العربي والإنجليزي إلى نصوص بدقة." },
                            { title: "تحليل النبرة والمشاعر", desc: "تشخيص آلي لنبرة التغطية الإعلامية وتقييم أثرها على سمعة المؤسسة." },
                            { title: "أرشيف رقمي فوري", desc: "أرشفة مقاطع البث واسترجاعها بسهولة مع تصدير التقارير التنفيذية." },
                        ]
                        : [
                            { title: "Satellite & Radio Tracking", desc: "Automated tracking of 3,400+ regional and international channels." },
                            { title: "AI Speech-to-Text", desc: "High-accuracy Arabic and English audio transcription using NLP models." },
                            { title: "Tone & Sentiment Analysis", desc: "Automated diagnosis of broadcast coverage tone and brand impact." },
                            { title: "Instant Digital Archive", desc: "Seamless broadcast clip archiving, search, and executive reporting." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "رصد الصحافة والمواقع الأخبارية", href: "/media-monitoring/press" },
                            { label: "نبض الإعلام وتحليل المشاعر", href: "/media-monitoring/media-pulse" },
                            { label: "إدارة أزمات السمعة الإعلامية", href: "/media-monitoring/crisis-management" },
                            { label: "مستودع الوسائط المركزي", href: "/media-monitoring/central-media-repository" },
                        ]
                        : [
                            { label: "Press & News Monitoring", href: "/media-monitoring/press" },
                            { label: "Media Pulse Sentiment Analytics", href: "/media-monitoring/media-pulse" },
                            { label: "Crisis & Reputation Management", href: "/media-monitoring/crisis-management" },
                            { label: "Central Media Repository", href: "/media-monitoring/central-media-repository" },
                        ]
                }
                iconType="tv-radio"
            />

            <TvRadioClient 
                initialReports={initialReports}
                initialSettings={{}}
                initialCrisisPlans={initialCrisisPlans}
            />
        </>
    );
}


