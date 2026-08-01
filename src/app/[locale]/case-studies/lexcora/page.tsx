/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import LexcoraClient from "@/components/LexcoraClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr
            ? "ليكسكورا — نظام ERP للمحاماة بالذكاء الاصطناعي | المستكشف"
            : "LEXCORA — AI-Powered Legal ERP for Law Firms | ALMSTKSHF",
        description: isAr
            ? "اكتشف كيف يحول ليكسكورا العمل القانوني لشركات المحاماة الكبرى في الإمارات والسعودية. نظام ERP قانوني متكامل بالذكاء الاصطناعي لإدارة القضايا والعقود والفواتير."
            : "Discover how LEXCORA transforms legal workflows for high-net-worth law firms in UAE and Saudi Arabia. AI-powered legal ERP for case management, contracts, and billing.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/case-studies/lexcora`,
            languages: {
                'x-default': 'https://www.almstkshf.com/ar/case-studies/lexcora',
                en: 'https://www.almstkshf.com/en/case-studies/lexcora',
                ar: 'https://www.almstkshf.com/ar/case-studies/lexcora',
            }
        },
    };
}

export default function LexcoraPage() {
    return <LexcoraClient />;
}
