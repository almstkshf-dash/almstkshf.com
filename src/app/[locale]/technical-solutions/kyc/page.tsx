/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import KYCClient from '@/components/KYCClient';

export const revalidate = 86400; // Revalidate every 24 hours

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";
    return {
        title: isAr
            ? "التحقق من الهوية والامتثال (KYC) — حلول أمنية للمؤسسات"
            : "KYC Identity Verification & Compliance — Enterprise Security Solutions",
        description: isAr
            ? "حلول التحقق الآلي من الهوية والامتثال التنظيمي (KYC) متوافقة مع متطلبات هيئة تنظيم الاتصالات والحكومة الرقمية (TDRA). فحص ذكي ومسح استخباراتي للمؤسسات في الإمارات والسعودية."
            : "Automated identity verification and regulatory compliance (KYC) solutions aligned with TDRA guidelines. Intelligent screening and intelligence scanning for enterprises in UAE and Saudi Arabia.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/technical-solutions/kyc`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/technical-solutions/kyc',
                en: 'https://www.almstkshf.com/en/technical-solutions/kyc',
                ar: 'https://www.almstkshf.com/ar/technical-solutions/kyc',
            }
        },
    };
}

import ServiceSchema from "@/components/ServiceSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import ServiceSeoHeader from "@/components/ServiceSeoHeader";

export default async function KYCPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isAr = locale === "ar";

    const title = isAr
        ? "التحقق من الهوية والامتثال التنظيمي (KYC) بالذكاء الاصطناعي"
        : "Automated KYC Identity Verification & Regulatory Compliance";

    const description = isAr
        ? "حلول التحقق الآلي من الهوية والامتثال التنظيمي (KYC) متوافقة مع متطلبات هيئة تنظيم الاتصالات والحكومة الرقمية (TDRA). فحص ذكي ومسح استخباراتي للمؤسسات في الإمارات والسعودية."
        : "Automated identity verification and regulatory compliance (KYC) solutions aligned with UAE TDRA guidelines. Intelligent screening and background intelligence scanning for enterprises in UAE and Saudi Arabia.";

    const url = `https://www.almstkshf.com/${locale}/technical-solutions/kyc`;

    const breadcrumbs = [
        { name: isAr ? "الرئيسية" : "Home", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الحلول التقنية" : "Technical Solutions", item: `https://www.almstkshf.com/${locale}` },
        { name: isAr ? "الامتثال والتحقق من الهوية" : "KYC Compliance", item: url },
    ];

    return (
        <>
            <ServiceSchema
                name={title}
                description={description}
                serviceType={isAr ? "التحقق من الهوية والامتثال" : "KYC & Identity Verification"}
                url={url}
                locale={locale}
                features={
                    isAr
                        ? ["التحقق من المستندات الرسمية", "مطابقة معايير TDRA", "الفحص الاستخباراتي المتطور", "تقارير الحوكمة والامتثال"]
                        : ["Official Document Verification", "TDRA Compliance Alignment", "Deep Intelligence Screening", "Governance & Compliance Audit Trail"]
                }
            />
            <BreadcrumbSchema items={breadcrumbs} />

            <ServiceSeoHeader
                badge={isAr ? "التحقق من الهوية والامتثال" : "KYC & Compliance Engineering"}
                title={isAr ? "نظام التحقق الذكي والامتثال لـ" : "Automated KYC & Regulatory Compliance for"}
                titleHighlight={isAr ? "المؤسسات في الإمارات والسعودية" : "Enterprises Across UAE & KSA"}
                description={description}
                metrics={[
                    { label: isAr ? "مطابقة معايير" : "Regulatory Alignment", value: "TDRA UAE" },
                    { label: isAr ? "سرعة التحقق" : "Verification Speed", value: "< 2s" },
                    { label: isAr ? "سرية البيانات" : "Data Protection", value: "SOC2 Type II" },
                    { label: isAr ? "الفحص الأمني" : "Security Screening", value: "Automated" },
                ]}
                features={
                    isAr
                        ? [
                            { title: "التحقق من الهوية الوطنية", desc: "مطابقة آلية للمستندات الرسمية وجوازات السفر والهويات الحكومية." },
                            { title: "الفحص الاستخباراتي الشامل", desc: "مسح البيانات في قوائم المراقبة ومكافحة غسل الأموال والقوائم الدولية." },
                            { title: "الامتثال لمعايير TDRA", desc: "أنظمة مصممة للتوافق الكامل مع التشريعات الرقمية في الإمارات والسعودية." },
                            { title: "سجل التدقيق والحوكمة", desc: "توثيق آلي كامل لجميع عمليات التحقق لتقديمها لجهات التفتيش والرقابة." },
                        ]
                        : [
                            { title: "National Identity Matching", desc: "Automated verification of passports, Emirates IDs, and official credentials." },
                            { title: "AML Watchlist Screening", desc: "Real-time background scanning against global sanction lists and watchlists." },
                            { title: "TDRA Regulatory Alignment", desc: "Engineered to satisfy UAE digital government regulatory requirements." },
                            { title: "Governance Audit Logs", desc: "Complete cryptographic audit trails generated for regulatory compliance." },
                        ]
                }
                relatedLinks={
                    isAr
                        ? [
                            { label: "إدارة أزمات السمعة الإعلامية", href: "/media-monitoring/crisis-management" },
                            { label: "مركز التكامل وواجهات API", href: "/technical-solutions/integration" },
                            { label: "نظام ليكسكورا ERP للمحاماة", href: "/case-studies/lexcora" },
                            { label: "أسعار الباقات والاشتراكات", href: "/pricing" },
                        ]
                        : [
                            { label: "Crisis & Reputation Management", href: "/media-monitoring/crisis-management" },
                            { label: "Integration Hub & APIs", href: "/technical-solutions/integration" },
                            { label: "LEXCORA Legal ERP Suite", href: "/case-studies/lexcora" },
                            { label: "Packages & Pricing", href: "/pricing" },
                        ]
                }
                iconType="kyc"
            />

            <KYCClient />
        </>
    );
}
