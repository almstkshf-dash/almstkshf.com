/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { unstable_cache } from "next/cache";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
    try {
        const rlKey = await getRateLimitKey(req, 'sentiment-overview');
        const limitResult = await rateLimit(rlKey, 30, 60);
        if (!limitResult.allowed) {
            return NextResponse.json({
                error: 'Rate limit exceeded'
            }, { status: 429, headers: { 'Retry-After': String(limitResult.resetSeconds) } });
        }

        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("keyword") || undefined;
        const sourceType = searchParams.get("sourceType") || undefined;
        const sourceCountry = searchParams.get("sourceCountry") || undefined;
        const depth = searchParams.get("depth") || undefined;

        // Use unstable_cache to cache this query on-demand
        const getCachedAnalyticsOverview = (
            keyword?: string,
            sourceType?: string,
            sourceCountry?: string,
            depth?: string
        ) => {
            return unstable_cache(
                async () => {
                    return await convex.query(api.monitoring.getAnalyticsOverview, {
                        keyword,
                        sourceType: sourceType === 'All' ? undefined : sourceType,
                        sourceCountry: sourceCountry === 'All' ? undefined : sourceCountry,
                        depth: depth === 'All' ? undefined : depth,
                    });
                },
                [
                    "sentiment-overview",
                    keyword || "all",
                    sourceType || "all",
                    sourceCountry || "all",
                    depth || "all",
                ],
                {
                    tags: ["sentiment-overview"],
                    revalidate: 60, // Fallback revalidation of 60 seconds
                }
            )();
        };

        const data = await getCachedAnalyticsOverview(keyword, sourceType, sourceCountry, depth);

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            data
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("API Overview Error:", err);
        return NextResponse.json({ error: err.message || String(error) }, { status: 500 });
    }
}
