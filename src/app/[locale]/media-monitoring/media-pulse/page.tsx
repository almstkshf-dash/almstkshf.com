/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import MediaPulseClient from "@/components/MediaPulseClient";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr
            ? "نبض الإعلام — تحليل مشاعر الرأي العام والسمعة الإعلامية"
            : "Media Pulse — Public Sentiment Analysis & Media Reputation Tracking",
        description: isAr
            ? "تحليل آني لمشاعر الرأي العام وتتبع السمعة الإعلامية بالذكاء الاصطناعي. رصد النبرة الإيجابية والسلبية عبر القنوات التلفزيونية والإذاعية والصحافة الرقمية في الإمارات والسعودية."
            : "Real-time public sentiment analysis and media reputation tracking powered by AI. Monitor positive and negative media tone across TV, radio, and digital press in the UAE and Saudi Arabia.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/media-pulse`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/media-monitoring/media-pulse',
                en: 'https://www.almstkshf.com/en/media-monitoring/media-pulse',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/media-pulse',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function MediaPulsePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";
    let initialArticles: any[] = [];
    try {
        const rawArticles = await prisma.mediaMonitoringArticle.findMany({
            take: 50,
            orderBy: { createdAt: "desc" }
        });
        initialArticles = rawArticles.map((a: any) => ({
            ...a,
            createdAt: Number(a.createdAt),
            status: "Published"
        }));
    } catch (e) {
        console.error("Server query error on MediaPulsePage:", e);
    }

    const title = isAr
        ? "نبض الإعلام — تحليل مشاعر الرأي العام والسمعة بالذكاء الاصطناعي"
        : "Media Pulse — AI Public Sentiment & Reputation Analysis";

    const description = isAr
        ? "تحليل آني لمشاعر الرأي العام وتتبع السمعة الإعلامية بالذكاء الاصطناعي. رصد النبرة الإيجابية والسلبية والتحول في التوجه الإعلامي عبر الإمارات والسعودية والخليج لدعم اتخاذ القرار الاستراتيجي."
        : "Real-time public sentiment analysis and media reputation tracking powered by AI. Monitor positive, neutral, and negative sentiment shifts across UAE, Saudi Arabia, and Gulf channels to support strategic decision-making.";

    const url = `https://www.almstkshf.com/${locale}/media-monitoring/media-pulse`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الرصد الإعلامي" : "Media Monitoring", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "نبض الإعلام وتحليل المشاعر" : "Media Pulse Sentiment", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "تحليل مشاعر الإعلام" : "Media Sentiment Analysis"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["تحليل المشاعر بالنصوص العربية والإنجليزية", "قياس اتجاهات الرأي العام", "تتبع سمعة العلامة التجارية", "مؤشرات تفاعلية للقيادة"]
                        : ["Arabic & English Sentiment NLP", "Public Opinion Trend Diagnostics", "Brand Reputation Tracking", "Executive Dashboard Analytics"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

import ServiceSeoHeader from "@/components/ServiceSeoHeader";

            <ServiceSeoHeader
                badge={isAr ? "نبض الإعلام وتحليل المشاعر" : "Media Pulse & Sentiment Analytics"}
                title={isAr ? "تحليل مشاعر وتوجهات الرأي العام في" : "AI Public Sentiment & Reputation Pulse Across"}
                titleHighlight={isAr ? "الإمارات والسعودية والخليج" : "UAE, Saudi Arabia & the Gulf"}
                description={description}
                metrics={[
                    { label: isAr ? "دقة تحليل المشاعر" : "Sentiment Accuracy", value: "98.7%" },
                    { label: isAr ? "تحليل اللهجات العربية" : "Arabic Dialect Support", value: "Full GCC" },
                    { label: isAr ? "مؤشرات تفاعلية" : "Live Pulse Charts", value: "Real-Time" },
                    { label: isAr ? "تصنيف النبرات" : "Tone Classification", value: "Pos / Neu / Neg" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "معالجة اللغة الطبيعية (NLP)", desc: "خوارزميات مدربة خصيصاً على اللهجات الخليجية وسياق الأخبار العربية." },
                            { title: "مؤشرات نبرة الرأي العام", desc: "تصنيف لحظي للتغطيات الإعلامية إلى إيجابية ومحايدة وسلبية." },
                            { title: "تتبع التحولات في السمعة", desc: "رصد التغيرات المفاجئة في انطباعات الجمهور حول المؤسسة أو العلامة التجارية." },
                            { title: "تقارير القيادة الاستراتيجية", desc: "لوحات قيادة تفاعلية وتصدير رسومات بيانية تدعم اتخاذ القرار." },
                        ]
                        : [
                            { title: "Arabic Dialect NLP Engine", desc: "Advanced language processing trained specifically on Gulf news contexts." },
                            { title: "Public Sentiment Categorization", desc: "Real-time coverage tone evaluation (Positive, Neutral, Negative)." },
                            { title: "Reputation Shift Tracking", desc: "Detecting sudden swings in public perception and brand tone." },
                            { title: "Executive Intelligence Charts", desc: "Interactive dashboards and visual analytics for strategic decision makers." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "إدارة أزمات السمعة الإعلامية", href: "/media-monitoring/crisis-management" },
                            { label: "رصد البث التلفزيوني والإذاعي", href: "/media-monitoring/tv-radio" },
                            { label: "رصد الصحافة والمواقع الأخبارية", href: "/media-monitoring/press" },
                            { label: "مستودع الوسائط المركزي", href: "/media-monitoring/central-media-repository" },
                        ]
                        : [
                            { label: "Crisis & Reputation Management", href: "/media-monitoring/crisis-management" },
                            { label: "TV & Radio Broadcast Monitoring", href: "/media-monitoring/tv-radio" },
                            { label: "Press & News Monitoring", href: "/media-monitoring/press" },
                            { label: "Central Media Repository", href: "/media-monitoring/central-media-repository" },
                        ]
                }
                iconType="pulse"
            />

            <MediaPulseClient
                initialArticles={initialArticles}
                initialAnalytics={{}}
                initialEmotions={{}}
                initialGeography={[]}
            />
        </>
    );
}

