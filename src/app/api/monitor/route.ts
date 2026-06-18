/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { resolveUrl } from "@/utils/linkResolver";
import { calculateMetrics } from "@/lib/metrics";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { unstable_cache } from "next/cache";
import { triggerOnDemandRevalidation } from "@/utils/revalidation";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const rlKey = await getRateLimitKey(req, 'monitor:post');
        const limit = await rateLimit(rlKey, 15, 60);
        if (!limit.allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } }
            );
        }

        const body = await req.json();
        const { url, keyword = "General", manualData } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // 1. Resolve URL & Metadata
        console.log(`Resolving URL: ${url}`);
        const resolved = await resolveUrl(url);

        if (!resolved) {
            // If manualData is valid, we might proceed, but typically we want a valid link.
            // If manual, maybe url is optional or we accept it as is?
            // User said: "If the link returns 404 or 403, DISCARD IT."
            if (!manualData) {
                return NextResponse.json({ error: "Invalid URL or 404/403" }, { status: 400 });
            }
        }

        const finalUrl = resolved?.finalUrl || url;
        const title = manualData?.title || "No Title"; // Resolver no longer returns title
        const content = manualData?.content || "No Content"; // Resolver no longer returns description
        const imageUrl = manualData?.imageUrl || resolved?.imageUrl; // Prefer manual if provided? or vice versa
        // Actually manualData implies "Manual Coverage Tool". If this API is used by that tool, manualData has priority.

        // 2. Analyze Content (Gemini)
        // If manualData has sentiment/etc, skip Gemini?
        // User prompt: "For every article, send Title + Snippet to Gemini".
        // If manual, user might provide sentiment.

        let analysisStatus: "pending" | "completed";
        let sentiment: "Positive" | "Neutral" | "Negative";
        let sourceCountry: string;

        if (manualData?.sentiment && manualData?.sourceCountry) {
            analysisStatus = "completed";
            sentiment = manualData.sentiment;
            sourceCountry = manualData.sourceCountry;
        } else {
            analysisStatus = "pending";
            sentiment = "Neutral";
            sourceCountry = manualData?.sourceCountry || "AE";
        }

        // 3. Metrics (Reach & AVE)
        let publisherName = manualData?.source || resolved?.source || new URL(finalUrl).hostname;
        const pubLower = publisherName.toLowerCase();
        if (pubLower.includes("google") || pubLower === "news.google.com") {
            const cleanTitle = title.replace(/\s*[-–|]\s*Google\s*(?:News)?\s*$/i, '').trim();
            const titleParts = cleanTitle.split(/\s+[-|]\s+/);
            if (titleParts.length > 1) {
                const potentialPub = titleParts[titleParts.length - 1].trim();
                if (potentialPub && !potentialPub.toLowerCase().includes("google")) {
                    publisherName = potentialPub;
                }
            }
        }

        // Fetch AVE Multiplier from Settings
        let aveMultiplier = 0.005;
        try {
            const settings = await convex.query(api.settings.getSettings);
            if (settings?.defaults?.aveMultiplier) {
                aveMultiplier = settings.defaults.aveMultiplier;
            }
        } catch (e) {
            console.warn("Failed to fetch settings, using default AVE multiplier", e);
        }

        const metrics = calculateMetrics(publisherName, manualData?.reach, aveMultiplier);

        // 4. Save to Database
        const articleData = {
            keyword: keyword,
            url: url,
            resolvedUrl: finalUrl,
            publishedDate: manualData?.date || new Date().toISOString().split('T')[0], // DD/MM/YYYY is requested format in schema, but typical is YYYY-MM-DD for sorting. 
            // User schema: "Published Date (Format: DD/MM/YYYY)"
            // I should respect the schema string format if strict.
            // Let's format it as DD/MM/YYYY
            title: title,
            content: content,
            language: "EN",
            sentiment: sentiment,
            sourceType: manualData?.sourceType || "Online News",
            sourceCountry: sourceCountry,
            source: publisherName,
            reach: metrics.reach,
            ave: metrics.ave,
            imageUrl: imageUrl || undefined,
            isManual: !!manualData,
            analysisStatus: analysisStatus,
        };

        // Fix Language: Check for Arabic characters
        const isArabic = /[\u0600-\u06FF]/.test(title + content);
        articleData.language = isArabic ? "AR" : "EN";


        // Fix Date format to DD/MM/YYYY
        if (!manualData?.date) {
            const d = new Date();
            articleData.publishedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

        }

        await convex.mutation(api.monitoring.saveArticle, articleData as any);

        // Trigger cache revalidation on-demand
        triggerOnDemandRevalidation();

        return NextResponse.json({ success: true, data: articleData });

    } catch (error: unknown) {
        console.error("Monitor API Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });

    }
}

export async function GET(req: NextRequest) {
    const rlKey = await getRateLimitKey(req, 'monitor:get');
    const rl = await rateLimit(rlKey, 60, 60);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429, headers: { 'Retry-After': String(rl.resetSeconds) } }
        );
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const skip = Number(searchParams.get("skip")) || 0;
    const sourceType = searchParams.get("sourceType") || undefined;
    const sourceCountry = searchParams.get("sourceCountry") || undefined;
    const depth = searchParams.get("depth") || undefined;

    try {
        const getCachedArticles = (
            limit: number,
            skip: number,
            sourceType?: string,
            sourceCountry?: string,
            depth?: string
        ) => {
            return unstable_cache(
                async () => {
                    return await convex.query(api.monitoring.getArticles, {
                        limit,
                        skip,
                        sourceType: sourceType === 'All' ? undefined : sourceType,
                        sourceCountry: sourceCountry === 'All' ? undefined : sourceCountry,
                        depth: depth === 'All' ? undefined : depth,
                    });
                },
                [
                    "monitor-articles",
                    String(limit),
                    String(skip),
                    sourceType || "all",
                    sourceCountry || "all",
                    depth || "all",
                ],
                {
                    tags: ["monitor-articles"],
                    revalidate: 60, // Fallback revalidation of 60 seconds
                }
            )();
        };

        const result = await getCachedArticles(limit, skip, sourceType, sourceCountry, depth) as { items?: unknown[]; total?: number; nextSkip?: number | null };
        return NextResponse.json({ success: true, count: result?.items?.length || 0, total: result?.total || 0, nextSkip: result?.nextSkip ?? null, data: result?.items || [] });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
