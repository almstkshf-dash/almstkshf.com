/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from "next";
import CentralMediaRepositoryClient from "@/components/CentralMediaRepositoryClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "مستودع الوسائط المركزي — إدارة الأصول الرقمية للمؤسسات"
            : "Central Media Repository — Enterprise Digital Asset Management",
        description: isAr
            ? "مستودع مركزي لإدارة وأرشفة الأصول الرقمية والملفات الإعلامية للمؤسسات الكبرى والجهات الحكومية في الإمارات والسعودية. بحث ذكي واسترجاع فوري للتغطيات الإعلامية."
            : "Central repository for managing and archiving digital assets and media files for enterprises and government entities in UAE and Saudi Arabia. Smart search and instant retrieval of media coverage.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/central-media-repository`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/media-monitoring/central-media-repository',
                en: 'https://www.almstkshf.com/en/media-monitoring/central-media-repository',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/central-media-repository',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function CentralMediaRepositoryPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";

    const title = isAr
        ? "مستودع الوسائط المركزي — إدارة الأصول الرقمية والأرشيف الإعلامي"
        : "Central Media Repository & Digital Asset Management";

    const description = isAr
        ? "مستودع مركزي للأصول الرقمية وإدارة وتحليل الملفات الإعلامية للمؤسسات الكبرى والجهات الحكومية في الإمارات والسعودية. أرشفة البث التلفزيوني والإذاعي والصحفي مع أداة بحث ذكي واسترجاع فوري للتغطيات."
        : "Central repository for digital asset management, media archiving, and coverage analysis for enterprise and government organizations across the UAE and Saudi Arabia. Intelligent indexing and instant retrieval.";

    const url = `https://www.almstkshf.com/${locale}/media-monitoring/central-media-repository`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الرصد الإعلامي" : "Media Monitoring", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "مستودع الوسائط المركزي" : "Central Media Repository", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "إدارة الأصول الرقمية" : "Digital Asset Management"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["أرشفة الوسائط الإعلامية", "تصنيف المواد بالذكاء الاصطناعي", "البحث الذكي في أسرع وقت", "تصدير التقارير المخصصة"]
                        : ["Media Archiving & Indexing", "AI Content Categorization", "Smart Instant Search", "Custom Executive Exporting"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

            <ServiceSeoHeader
                badge={isAr ? "مستودع الوسائط المركزي" : "Central Media Repository"}
                title={isAr ? "إدارة الأصول الرقمية والأرشيف الإعلامي في" : "Enterprise Digital Asset Management Across"}
                titleHighlight={isAr ? "الإمارات والسعودية والخليج" : "UAE, Saudi Arabia & the GCC"}
                description={description}
                metrics={[
                    { label: isAr ? "ملفات مؤرشفة" : "Archived Assets", value: "Unlimited" },
                    { label: isAr ? "سرعة البحث" : "Search Latency", value: "< 100ms" },
                    { label: isAr ? "أمان البيانات" : "Security Standard", value: "SOC2 Type II" },
                    { label: isAr ? "تصدير الملفات" : "Export Formats", value: "PDF / XLS / Zip" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "أرشفة الوسائط المتعددة", desc: "تخزين وتنظيم مقاطع الفيديو والتسجيلات الصوتية والمقالات الصحفية." },
                            { title: "فهرسة وتصنيف ذكي", desc: "تصنيف آلي للمواد الإعلامية حسب الكلمات المفتاحية، الجهات، والتاريخ." },
                            { title: "محرك بحث فائق السرعة", desc: "استرجاع فوري للأرشيف الإعلامي مع فلاتر دقيقة تخدم فريق العلاقات العامة." },
                            { title: "إعادة الاستخدام والمشاركة", desc: "إنشاء مجموعات تقارير وتصديرها بسهولة ومشاركتها مع فرق العمل." },
                        ]
                        : [
                            { title: "Multimedia Asset Archiving", desc: "Centralized storage for broadcast video, audio, and print clippings." },
                            { title: "AI Content Indexing", desc: "Automated tagging and taxonomy categorization by brand, topic, and date." },
                            { title: "Sub-Second Search Engine", desc: "Instant retrieval of historical media coverage with granular query filters." },
                            { title: "Collection Exporting", desc: "Curate custom media report collections and share with internal stakeholders." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "رصد البث التلفزيوني والإذاعي", href: "/media-monitoring/tv-radio" },
                            { label: "رصد الصحافة والمواقع الأخبارية", href: "/media-monitoring/press" },
                            { label: "نبض الإعلام وتحليل المشاعر", href: "/media-monitoring/media-pulse" },
                            { label: "مركز التكامل وواجهات API", href: "/technical-solutions/integration" },
                        ]
                        : [
                            { label: "TV & Radio Broadcast Monitoring", href: "/media-monitoring/tv-radio" },
                            { label: "Press & News Monitoring", href: "/media-monitoring/press" },
                            { label: "Media Pulse Sentiment Analytics", href: "/media-monitoring/media-pulse" },
                            { label: "Integration Hub & APIs", href: "/technical-solutions/integration" },
                        ]
                }
                iconType="repository"
            />

            <CentralMediaRepositoryClient
                initialCollections={[]}
                initialSettings={null}
            />
        </>
    );
}

