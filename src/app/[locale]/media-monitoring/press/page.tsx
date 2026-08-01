/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from "next";
import PressClient from "@/components/PressClient";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "رصد الصحافة المطبوعة والرقمية — تغطية إعلامية شاملة في الخليج"
            : "Press & Digital Publication Monitoring — Gulf Media Coverage",
        description: isAr
            ? "رصد وتحليل التغطيات الصحفية المطبوعة والإلكترونية في الإمارات والسعودية والخليج. متابعة الصحف والمجلات ومواقع الأخبار مع تقارير فورية وتحليل النبرة الإعلامية."
            : "Monitor and analyze print and online press coverage across UAE, Saudi Arabia and the Gulf. Track newspapers, magazines and news sites with real-time reports and media tone analysis.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/press`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/media-monitoring/press',
                en: 'https://www.almstkshf.com/en/media-monitoring/press',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/press',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";

    const title = isAr
        ? "رصد الصحافة المطبوعة والرقمية والأخبار الإلكترونية في الخليج"
        : "Print Press & Online Digital News Monitoring in the Gulf";

    const description = isAr
        ? "تغطية شاملة ومباشرة للصحف الورقية والمجلات والمواقع الإخبارية الإلكترونية والبيانات الصحفية في الإمارات والسعودية والخليج. تحليل آلي للعناوين والنصوص والنبرة الإعلامية مع أرشفة رقمية."
        : "Comprehensive real-time tracking of print newspapers, digital magazines, online news portals, and press releases across the UAE, Saudi Arabia, and the Gulf. Automated NLP content analysis and media archiving.";

    const url = `https://www.almstkshf.com/${locale}/media-monitoring/press`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الرصد الإعلامي" : "Media Monitoring", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "رصد الصحافة والمواقع الأخبارية" : "Press Monitoring", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "رصد الصحافة والنشر" : "Press & Publication Monitoring"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["رصد الصحف الورقية والرقمية", "تتبع البيانات الصحفية", "تحليل القيمة الإعلانية الموازية (AVE)", "تقارير الصحافة اليومية"]
                        : ["Print & Digital Press Tracking", "Press Release Monitoring", "Advertising Value Equivalency (AVE)", "Daily Executive Press Clippings"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

import ServiceSeoHeader from "@/components/ServiceSeoHeader";

            <ServiceSeoHeader
                badge={isAr ? "رصد الصحافة المطبوعة والرقمية" : "Print & Digital Press Monitoring"}
                title={isAr ? "رصد الصحف والمواقع الإخبارية في" : "Print Press & Digital News Tracking Across"}
                titleHighlight={isAr ? "الإمارات والسعودية والخليج" : "UAE, Saudi Arabia & the Gulf"}
                description={description}
                metrics={[
                    { label: isAr ? "صحيفة وموقع إخباري" : "News Sources", value: "+12,000" },
                    { label: isAr ? "متابعة يومية" : "Daily Press Clippings", value: "24/7" },
                    { label: isAr ? "تقييم AVE" : "AVE Calculation", value: "Real-Time" },
                    { label: isAr ? "تحديث التغطيات" : "Update Speed", value: "Instant" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "رصد الصحف المطبوعة", desc: "مسح يومي للصحف الورقية والمجلات القومية والإقليمية في الإمارات والسعودية." },
                            { title: "متابعة المواقع الرقمية", desc: "تتبع آلي لأهم شبكات الأخبار والمقالات الصحفية والمدونات المعتمدة." },
                            { title: "حساب القيمة الإعلانية (AVE)", desc: "قياس القيمة المالية الموازية للتغطيات الصحفية مقارنة بالإعلانات المدفوعة." },
                            { title: "موجز صحفي يومي", desc: "إصدار ملخصات تنفيذية يومية بتنسيقات متعددة تخدم الإدارة العليا." },
                        ]
                        : [
                            { title: "Print Press Scanning", desc: "Daily monitoring of national and regional printed newspapers and magazines." },
                            { title: "Digital News Tracking", desc: "Automated indexing of major digital news networks and verified portals." },
                            { title: "AVE Value Calculation", desc: "Measuring the equivalent advertising value of earned press coverage." },
                            { title: "Daily Executive Clippings", desc: "Curated daily executive digests delivered in multiple export formats." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "رصد البث التلفزيوني والإذاعي", href: "/media-monitoring/tv-radio" },
                            { label: "نبض الإعلام وتحليل المشاعر", href: "/media-monitoring/media-pulse" },
                            { label: "إدارة أزمات السمعة الإعلامية", href: "/media-monitoring/crisis-management" },
                            { label: "مستودع الوسائط المركزي", href: "/media-monitoring/central-media-repository" },
                        ]
                        : [
                            { label: "TV & Radio Broadcast Monitoring", href: "/media-monitoring/tv-radio" },
                            { label: "Media Pulse Sentiment Analytics", href: "/media-monitoring/media-pulse" },
                            { label: "Crisis & Reputation Management", href: "/media-monitoring/crisis-management" },
                            { label: "Central Media Repository", href: "/media-monitoring/central-media-repository" },
                        ]
                }
                iconType="press"
            />

            <PressClient 
                initialReports={[]}
                initialSettings={{}}
                initialCrisisPlans={[]}
            />
        </>
    );
}

