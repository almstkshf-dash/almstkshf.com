/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import IntegrationClient from '@/components/IntegrationClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "مركز التكامل وواجهات API — ربط أنظمة الرصد الإعلامي"
            : "Integration Hub & API — Connect Your Media Monitoring Systems",
        description: isAr
            ? "اربط منصة الرصد الإعلامي بأنظمتك الحالية عبر واجهات API آمنة. تكامل سلس مع أنظمة ERP وCRM وأدوات التحليل للمؤسسات في الإمارات والسعودية."
            : "Connect the media monitoring platform to your existing systems via secure APIs. Seamless integration with ERP, CRM, and analytics tools for enterprises in UAE and Saudi Arabia.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/technical-solutions/integration`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/technical-solutions/integration',
                en: 'https://www.almstkshf.com/en/technical-solutions/integration',
                ar: 'https://www.almstkshf.com/ar/technical-solutions/integration',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function IntegrationPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";

    const title = isAr
        ? "مركز التكامل وربط واجهات البرمجة (API) لأنظمة الرصد الإعلامي"
        : "Enterprise Integration Hub & Secure Media Monitoring APIs";

    const description = isAr
        ? "اربط منصة الرصد الإعلامي بأنظمتك الحالية عبر واجهات API آمنة وعالية السرعة. تكامل سلس مع أنظمة إدارة علاقات العملاء (CRM)، وأنظمة تخطيط الموارد (ERP)، وأدوات تحليل البيانات."
        : "Connect the ALMSTKSHF media intelligence platform directly to your internal software ecosystem via secure REST APIs. Seamless integration for CRM, ERP, and executive analytics tools.";

    const url = `https://www.almstkshf.com/${locale}/technical-solutions/integration`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الحلول التقنية" : "Technical Solutions", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "مركز التكامل وواجهات API" : "Integration Hub", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "تكامل الأنظمة وواجهات API" : "API System Integration"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["واجهات RESTful API عالية الأداء", "التزامن الفوري للبيانات", "طبقة الربط الآمنة", "دعم أنظمة المؤسسات الكبرى"]
                        : ["High-Performance RESTful APIs", "Real-Time Webhook Data Sync", "Military-Grade Integration Security", "Enterprise System Connectors"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

            <ServiceSeoHeader
                badge={isAr ? "مركز التكامل والربط التقني" : "API & Systems Integration Hub"}
                title={isAr ? "ربط منصة الرصد الإعلامي بـ" : "Seamlessly Connect Media Monitoring to"}
                titleHighlight={isAr ? "أنظمة وبنية المؤسسات التقنية" : "Your Enterprise Ecosystem"}
                description={description}
                metrics={[
                    { label: isAr ? "نوع البروتوكول" : "Protocol Standard", value: "REST / Webhooks" },
                    { label: isAr ? "جاهزية الخدمة" : "System Uptime", value: "99.95%" },
                    { label: isAr ? "زمن الاستجابة" : "API Latency", value: "< 50ms" },
                    { label: isAr ? "التشفير والأمان" : "Data Encryption", value: "TLS 1.3" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "واجهات RESTful API فتقية", desc: "ربط برمجي مرن يتيح جلب البيانات والتقارير البرمجية مباشرة لأنظمتك." },
                            { title: "التزامن الفوري (Webhooks)", desc: "استلام التنبيهات والأخبار فور نشرها وتغذية قواعد بيانات المؤسسة تلقائياً." },
                            { title: "التكامل مع أنظمة ERP وCRM", desc: "ربط سلس مع منصات إدارة المؤسسات وتوجيه التغطيات لفريق العلاقات العامة." },
                            { title: "أمان بمعايير عسكرية", desc: "طبقات حماية مفاتيح API وتشفير البيانات أثناء النقل والتخزين." },
                        ]
                        : [
                            { title: "RESTful API Integration", desc: "Flexible programmatic endpoints to stream coverage data directly into internal tools." },
                            { title: "Real-Time Webhook Push", desc: "Instant push notifications feeding internal enterprise databases automatically." },
                            { title: "ERP & CRM Connectors", desc: "Native integration routing media coverage to internal PR and executive teams." },
                            { title: "Military-Grade Security", desc: "Granular API key management, scope control, and TLS 1.3 encryption." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "مستودع الوسائط المركزي", href: "/media-monitoring/central-media-repository" },
                            { label: "التحقق من الهوية والامتثال KYC", href: "/technical-solutions/kyc" },
                            { label: "نبض الإعلام وتحليل المشاعر", href: "/media-monitoring/media-pulse" },
                            { label: "أسعار الباقات والاشتراكات", href: "/pricing" },
                        ]
                        : [
                            { label: "Central Media Repository", href: "/media-monitoring/central-media-repository" },
                            { label: "KYC Identity & Compliance", href: "/technical-solutions/kyc" },
                            { label: "Media Pulse Sentiment Analytics", href: "/media-monitoring/media-pulse" },
                            { label: "Packages & Pricing", href: "/pricing" },
                        ]
                }
                iconType="integration"
            />

            <IntegrationClient />
        </>
    );
}