/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { ConvexHttpClient } from "convex/browser";

/**
 * Returns a ConvexHttpClient if NEXT_PUBLIC_CONVEX_URL is valid, or null otherwise.
 * Prevents module evaluation build crashes during Next.js static page collection.
 */
export function getConvexClient(): ConvexHttpClient | null {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url || url.includes("<your-convex-deployment-url>") || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        return null;
    }
    return new ConvexHttpClient(url);
}

/**
 * Returns a ConvexHttpClient or throws a runtime error if executed when Convex URL is missing.
 */
export function getConvexClientOrThrow(): ConvexHttpClient {
    const client = getConvexClient();
    if (!client) {
        throw new Error("[ConvexClient] NEXT_PUBLIC_CONVEX_URL is missing or invalid.");
    }
    return client;
}
