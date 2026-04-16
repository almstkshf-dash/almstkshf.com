/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import BehindTheSceneClient from "@/components/BehindTheSceneClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isAr = locale === "ar";

    return {
        title: isAr ? "خلف الكواليس | فريق الإدارة" : "Behind the Scene | Management Team",
        description: isAr
            ? "تعرف على الفريق القيادي وراء منظومة ذكاء المستكشف."
            : "Meet the leadership team behind the Almstkshf intelligence ecosystem.",
        alternates: {
            canonical: `https://www.almstkshf.com/${locale}/behind-the-scene`,
        },
    };
}

export default function BehindTheScenePage() {
    return <BehindTheSceneClient />;
}
