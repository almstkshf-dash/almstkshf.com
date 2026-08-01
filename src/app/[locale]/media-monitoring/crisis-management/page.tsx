/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from "next";
import CrisisManagementClient from "@/components/CrisisManagementClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "إدارة أزمات السمعة الإعلامية — تنبيهات فورية وخطط استجابة"
            : "Media Crisis & Reputation Management — Real-Time Alerts & Response Plans",
        description: isAr
            ? "بنية تحتية متطورة لرصد الأزمات الإعلامية والتحكم بالسمعة في الوقت الفعلي. تنبيهات فورية وخطط استجابة للمؤسسات الحكومية والشركات الكبرى في الإمارات والسعودية."
            : "Advanced infrastructure for media crisis monitoring and real-time reputational protection. Instant alerts and response plans for government entities and enterprises across UAE and Saudi Arabia.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/crisis-management`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/media-monitoring/crisis-management',
                en: 'https://www.almstkshf.com/en/media-monitoring/crisis-management',
                ar: 'https://www.almstkshf.com/ar/media-monitoring/crisis-management',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function CrisisManagementPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";

    const title = isAr
        ? "إدارة أزمات السمعة الإعلامية وتنبيهات الأزمات الفورية"
        : "Media Crisis & Reputation Management Infrastructure";

    const description = isAr
        ? "بنية تحتية متطورة لرصد الأزمات الإعلامية والتحكم بالسمعة في الوقت الفعلي. المستكشف يقدم تنبيهات فورية، تحليل المخاطر الاستراتيجية، وخطط الاستجابة التلقائية لحماية سمعة المؤسسات والشركات الكبرى في الإمارات والسعودية."
        : "Advanced infrastructure for media crisis monitoring and real-time reputational protection. ALMSTKSHF delivers automated crisis alerts, strategic risk scoring, and instant response protocols for government and enterprise clients.";

    const url = `https://www.almstkshf.com/${locale}/media-monitoring/crisis-management`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الرصد الإعلامي" : "Media Monitoring", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "إدارة الأزمات الإعلامية" : "Crisis Management", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "إدارة أزمات السمعة" : "Crisis & Reputation Management"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["تنبيهات الأزمات عبر الواتساب", "تقييم أخطار السمعة الإعلامية", "مواجهة الأخبار الزائفة", "إعداد خطط الطوارئ الإعلامية"]
                        : ["Real-Time WhatsApp Crisis Alerts", "Reputational Risk Scoring", "Fake News Detection & Safeguards", "Automated Response Playbooks"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

            <ServiceSeoHeader
                badge={isAr ? "حماية السمعة وإدارة الأزمات" : "Reputation Safeguards & Crisis Control"}
                title={isAr ? "نظام الاستجابة لرصد وتحييد" : "Real-Time Crisis Detection &"}
                titleHighlight={isAr ? "الأزمات الإعلامية بالذكاء الاصطناعي" : "Reputation Safeguards"}
                description={description}
                metrics={[
                    { label: isAr ? "سرعة إرسال التنبيه" : "Alert Trigger Speed", value: "< 1s" },
                    { label: isAr ? "قنوات الإشعارات" : "Alert Channels", value: "WhatsApp / Email" },
                    { label: isAr ? "دقة تقييم المخاطر" : "Risk Scoring", value: "AI Multi-Scale" },
                    { label: isAr ? "حماية السمعة" : "Reputation Shield", value: "24/7 Active" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "تنبيهات الأزمات الفورية", desc: "إشعارات فتكية مباشرة عبر الواتساب والبريد الإلكتروني فور رصد النبرة السلبية." },
                            { title: "مؤشرات قياس المخاطر", desc: "خوارزميات تصنيف مخاطر الانتشار وتوقع المسارات المحتملة للأخبار السلبية." },
                            { title: "مواجهة الشائعات والأخبار الزائفة", desc: "رصد وتتبع مصادر المعلومات المغلوطة قبل تحولها إلى أزمة إعلامية." },
                            { title: "خطط الاستجابة التلقائية", desc: "بروتوكولات جاهزة للرد والتواصل مع الرأي العام وفق أفضل الممارسات." },
                        ]
                        : [
                            { title: "Instant WhatsApp & Email Alerts", desc: "Immediate trigger notifications dispatched the moment negative sentiment spikes." },
                            { title: "Predictive Risk Scoring", desc: "Algorithmic risk evaluation estimating velocity and reach of negative stories." },
                            { title: "Fake News & Rumor Countermeasures", desc: "Origin tracking of unverified rumors before escalating into full crises." },
                            { title: "Automated Response Protocols", desc: "Pre-approved response playbooks and communications workflows ready for action." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "نبض الإعلام وتحليل المشاعر", href: "/media-monitoring/media-pulse" },
                            { label: "رصد البث التلفزيوني والإذاعي", href: "/media-monitoring/tv-radio" },
                            { label: "رصد الصحافة والمواقع الأخبارية", href: "/media-monitoring/press" },
                            { label: "التحقق من الهوية والامتثال KYC", href: "/technical-solutions/kyc" },
                        ]
                        : [
                            { label: "Media Pulse Sentiment Analytics", href: "/media-monitoring/media-pulse" },
                            { label: "TV & Radio Broadcast Monitoring", href: "/media-monitoring/tv-radio" },
                            { label: "Press & News Monitoring", href: "/media-monitoring/press" },
                            { label: "KYC Identity & Security Verification", href: "/technical-solutions/kyc" },
                        ]
                }
                iconType="crisis"
            />

            <CrisisManagementClient 
                initialReports={[]}
                initialSettings={null}
                initialCrisisPlans={[]}
            />
        </>
    );
}

