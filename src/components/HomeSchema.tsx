/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import React from 'react';

/**
 * HomeSchema — Server Component.
 *
 * Injects locale-aware JSON-LD structured data into the home page <head>
 * for media monitoring, sentiment diagnostics, and automated media analysis
 * platforms (search entity properties per Schema.org).
 *
 * Rendered server-side so search engine crawlers receive it in the initial HTML
 * without needing to execute JavaScript.
 */
export default function HomeSchema({ locale }: { locale: string }) {
    const isAr = locale === 'ar';
    const baseUrl = 'https://www.almstkshf.com';

    const schemas: Record<string, any>[] = [
        // ── 1. SoftwareApplication — the media monitoring platform itself ──
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            '@id': `${baseUrl}/#platform`,
            'name': isAr ? 'المستكشف — منصة الرصد الإعلامي' : 'ALMSTKSHF Media Monitoring Platform',
            'url': `${baseUrl}/${locale}`,
            'description': isAr
                ? 'منصة ذكاء اصطناعي لرصد الإعلام وتحليل المشاعر والتتبع الآلي للتغطية الإعلامية في الشرق الأوسط وشمال أفريقيا.'
                : 'AI-powered platform for media tracking, sentiment diagnostics, and automated media analysis across MENA.',
            'applicationCategory': 'BusinessApplication',
            'operatingSystem': 'Web',
            'inLanguage': ['ar', 'en'],
            'offers': {
                '@type': 'Offer',
                'url': `${baseUrl}/${locale}/pricing`,
                'priceCurrency': 'USD',
                'availability': 'https://schema.org/InStock',
            },
            'publisher': { '@id': `${baseUrl}/#organization` },
            'featureList': isAr
                ? [
                    'رصد التلفزيون والراديو في الوقت الفعلي',
                    'رصد الصحافة المطبوعة والإلكترونية',
                    'تحليل المشاعر بالذكاء الاصطناعي',
                    'إدارة الأزمات الإعلامية',
                    'مستودع الوسائط المركزي',
                    'تقارير تلقائية',
                ]
                : [
                    'Real-time TV & Radio monitoring',
                    'Print & online press monitoring',
                    'AI sentiment diagnostics',
                    'Media crisis management',
                    'Central media repository',
                    'Automated reporting',
                ],
        },

        // ── 2. Service — Sentiment Diagnostics ──
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${baseUrl}/#sentiment-service`,
            'name': isAr ? 'تحليل المشاعر الإعلامية' : 'Media Sentiment Diagnostics',
            'description': isAr
                ? 'تحليل آلي لمشاعر التغطية الإعلامية باستخدام معالجة اللغة الطبيعية لدعم القرار الاستراتيجي.'
                : 'Automated analysis of media coverage sentiment using NLP to support strategic decision-making.',
            'provider': { '@id': `${baseUrl}/#organization` },
            'areaServed': {
                '@type': 'Place',
                'name': isAr ? 'الشرق الأوسط وشمال أفريقيا' : 'Middle East and North Africa',
            },
            'availableLanguage': ['Arabic', 'English'],
            'url': `${baseUrl}/${locale}/media-monitoring/media-pulse`,
            'serviceType': isAr ? 'تحليل البيانات الإعلامية' : 'Media Data Analytics',
        },

        // ── 3. Service — Automated Media Analysis ──
        {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${baseUrl}/#automated-media-analysis`,
            'name': isAr ? 'الرصد الإعلامي الآلي' : 'Automated Media Analysis',
            'description': isAr
                ? 'تتبع وتحليل التغطيات التلفزيونية والإذاعية والإلكترونية آلياً مع تقارير فورية ومنبهات الأزمات.'
                : 'Automated tracking and analysis of TV, radio, and online coverage with instant reports and crisis alerts.',
            'provider': { '@id': `${baseUrl}/#organization` },
            'areaServed': {
                '@type': 'Place',
                'name': isAr ? 'الشرق الأوسط وشمال أفريقيا' : 'Middle East and North Africa',
            },
            'availableLanguage': ['Arabic', 'English'],
            'url': `${baseUrl}/${locale}/media-monitoring/tv-radio`,
            'serviceType': isAr ? 'رصد إعلامي' : 'Media Monitoring',
        },

        // ── 4. FAQPage — Rich Snippets for Search ──
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': isAr
                ? [
                    {
                        '@type': 'Question',
                        'name': 'ما هي منصة المستكشف للرصد الإعلامي؟',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'المستكشف هي منصة ذكاء اصطناعي متخصصة في رصد البث التلفزيوني والإذاعي والصحافة المطبوعة والرقمية وتحليل مشاعر الرأي العام في الإمارات والسعودية والخليج.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'كيف يتم تحليل المشاعر والنبرة الإعلامية؟',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'تستخدم المنصة خوارزميات معالجة اللغة الطبيعية (NLP) المتطورة لتحليل التغطيات الإعلامية باللغتين العربية والإنجليزية وتحديد المشاعر (إيجابي، محايد، سلبي) بدقة عالية.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'هل يوفر المستكشف تنبيهات فورية للأزمات الإعلامية؟',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'نعم، المنصة ترسل تنبيهات فتكية وفورية عبر الواتساب والبريد الإلكتروني عند اكتشاف نبرة سلبية أو مؤشرات أزمة سمعة إعلامية.'
                        }
                    }
                ]
                : [
                    {
                        '@type': 'Question',
                        'name': 'What is the ALMSTKSHF Media Monitoring Platform?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'ALMSTKSHF is an AI-powered media intelligence platform that monitors TV, radio broadcasts, print, and digital press, offering sentiment analysis across the UAE, Saudi Arabia, and the Gulf.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'How does ALMSTKSHF perform Arabic sentiment analysis?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'The platform uses advanced Natural Language Processing (NLP) models specifically trained on Arabic dialects and news contexts to evaluate sentiment (positive, neutral, negative) accurately.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'Does ALMSTKSHF support real-time crisis alerts?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'Yes, ALMSTKSHF provides instant WhatsApp and email notifications whenever negative sentiment spikes or potential reputation risks are detected.'
                        }
                    }
                ]
        }
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
    );
}
