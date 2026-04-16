/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import MediaPulseClient from "@/components/MediaPulseClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "نبض الإعلام - رصد فوري للعلامة التجارية" : "Media Pulse - Real-time Brand Tracking",
        description: isAr
            ? "رصد وتحليل فوري للرأي العام وتغطية العلامة التجارية عبر آلاف المصادر العالمية."
            : "Real-time tracking and analysis of public opinion and brand coverage across thousands of global sources.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/media-monitoring/media-pulse`,
        },
    };
}

export default function MediaPulsePage() {
    return <MediaPulseClient />;
}
