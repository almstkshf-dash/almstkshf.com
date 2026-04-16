/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import SmartMediaAssistantClient from "@/components/SmartMediaAssistantClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "مساعد الوسائط الذكي | قدرات الذكاء الاصطناعي المتقدمة" : "Smart Media Assistant | Advanced AI Capabilities",
        description: isAr
            ? "قدرات الذكاء الاصطناعي من المستكشف لإنشاء المحتوى عند الطلب ودعم استراتيجية الاتصال."
            : "Almstkshf AI capabilities for on-demand content generation and communication strategy support.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/technical-solutions/smart-media-assistant`,
        },
    };
}

export default function SmartMediaAssistantPage() {
    return <SmartMediaAssistantClient />;
}
