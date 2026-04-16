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
        title: isAr ? "ليكسكورا | جناح ERP القانوني المتقدم" : "LEXCORA | Advanced Legal ERP Suite",
        description: isAr
            ? "اكتشف كيف يغير ليكسكورا العمل القانوني لشركات المحاماة الكبرى باستخدام الذكاء الاصطناعي والأتمتة."
            : "Discover how LEXCORA transforms legal workflows for high-net-worth law firms with AI and automation.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/case-studies/lexcora`,
        },
    };
}

export default function LexcoraPage() {
    return <LexcoraClient />;
}
