/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query } from "./_generated/server";

export const getAvailable = query({
    args: {},
    handler: async (ctx) => {
        return [
            {
                id: "slack",
                nameEn: "Slack",
                nameAr: "سلاك",
                descEn: "Receive real-time sentiment alerts and crisis notifications directly in your team's Slack channels.",
                descAr: "تلقي تنبيهات المشاعر الفورية وإشعارات الأزمات مباشرة في قنوات Slack الخاصة بفريقك.",
                categoryEn: "Messaging",
                categoryAr: "المراسلة",
                icon: "Slack",
                active: true,
            },
            {
                id: "webhooks",
                nameEn: "Custom Webhooks",
                nameAr: "خطافات الويب (Webhooks)",
                descEn: "Trigger custom HTTP callbacks to your own systems whenever new media articles are analyzed.",
                descAr: "قم بتشغيل استدعاءات HTTP مخصصة لأنظمتك الخاصة فور تحليل مقالات إعلامية جديدة.",
                categoryEn: "Developer Tools",
                categoryAr: "أدوات المطورين",
                icon: "Webhook",
                active: true,
            },
            {
                id: "crm",
                nameEn: "CRM Systems",
                nameAr: "أنظمة إدارة العملاء (CRM)",
                descEn: "Sync media insights and corporate reputation profiles directly with Salesforce, HubSpot, or Microsoft Dynamics.",
                descAr: "مزامنة رؤى وسائل الإعلام وملفات السمعة المؤسسية مباشرة مع Salesforce أو HubSpot أو Microsoft Dynamics.",
                categoryEn: "CRM & Sales",
                categoryAr: "إدارة العملاء والمبيعات",
                icon: "Database",
                active: true,
            },
            {
                id: "teams",
                nameEn: "Microsoft Teams",
                nameAr: "مايكروسوفت تيمز",
                descEn: "Share automated media summary reports and broadcast intelligence inside Microsoft Teams spaces.",
                descAr: "مشاركة تقارير ملخصات الإعلام التلقائية واستخبارات البث داخل مساحات Microsoft Teams.",
                categoryEn: "Messaging",
                categoryAr: "المراسلة",
                icon: "Users",
                active: true,
            },
            {
                id: "email",
                nameEn: "Email Digests",
                nameAr: "ملخصات البريد الإلكتروني",
                descEn: "Configure periodic custom digests and instant emergency notifications sent to your inbox.",
                descAr: "تكوين ملخصات مخصصة دورية وإشعارات طوارئ فورية يتم إرسالها إلى بريدك الإلكتروني.",
                categoryEn: "Notifications",
                categoryAr: "الإشعارات",
                icon: "Mail",
                active: true,
            }
        ];
    },
});
