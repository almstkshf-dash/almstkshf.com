/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Triggers on-demand revalidation for Next.js Data Cache tags 
 * and localized dashboard/media-pulse pages.
 */
export function triggerOnDemandRevalidation() {
    try {
        console.log("🔄 [Revalidation] Triggering on-demand cache revalidation...");
        
        // Revalidate specific tags
        revalidateTag('monitor-articles');
        revalidateTag('sentiment-overview');
        revalidateTag('sentiment-risk');
        
        // Revalidate localized dashboard pages
        revalidatePath('/en/dashboard');
        revalidatePath('/ar/dashboard');
        
        // Revalidate localized Media Pulse details pages
        revalidatePath('/en/media-monitoring/media-pulse');
        revalidatePath('/ar/media-monitoring/media-pulse');
        
        console.log("✅ [Revalidation] Revalidation triggered successfully.");
    } catch (error) {
        console.error("❌ [Revalidation] Failed to trigger revalidation:", error);
    }
}
