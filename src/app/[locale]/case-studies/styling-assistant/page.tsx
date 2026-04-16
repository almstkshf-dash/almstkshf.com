/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import StylingAssistantClient from "@/components/StylingAssistantClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "دراسة حالة: مساعد التنسيق الذكي" : "Case Study: Smart Styling Assistant",
        description: isAr
            ? "اكتشف كيف يغير مساعد التنسيق الذكي تجربة التسوق الرقمي باستخدام الذكاء الاصطناعي."
            : "Discover how Smart Styling Assistant revolutionizes digital shopping with AI.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/case-studies/styling-assistant`,
        },
    };
}

export default function StylingAssistantPage() {
    return <StylingAssistantClient />;
}
