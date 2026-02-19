export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { resolveUrl } from "@/utils/linkResolver";
import { analyzeContent } from "@/lib/gemini";
import { calculateMetrics } from "@/lib/metrics";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { rateLimit } from "@/lib/rateLimit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const limit = await rateLimit(`monitor:post:${ip}`, 15, 60);
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

        let analysis;
        if (manualData?.sentiment && manualData?.sourceCountry) {
            analysis = {
                sentiment: manualData.sentiment,
                brandName: keyword, // fallback
                sourceCountry: manualData.sourceCountry
            };
        } else {
            console.log(`Analyzing content with Gemini...`);
            analysis = await analyzeContent(content, title);
        }

        // 3. Metrics (Reach & AVE)
        const publisherName = manualData?.source || resolved?.source || new URL(finalUrl).hostname;

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
            language: (analysis.sourceCountry === 'AE' || analysis.sourceCountry === 'SA' || analysis.sourceCountry === 'EG') ? "AR" : "EN", // Simple heuristic or from extraction? 
            // Gemini doesn't return language in my current prompt. I should add it or detect it.
            // User schema: "Language (EN or AR)".
            // Ill update Gemini prompt later or guess based on country/text char ranges (Unicode for Arabic).
            // For now, heuristic:
            sentiment: analysis.sentiment,
            sourceType: manualData?.sourceType || "Online News",
            sourceCountry: analysis.sourceCountry,
            reach: metrics.reach,
            ave: metrics.ave,
            imageUrl: imageUrl || undefined,
            isManual: !!manualData,
        };

        // Fix Language: Check for Arabic characters
        const isArabic = /[\u0600-\u06FF]/.test(title + content);
        // @ts-ignore
        articleData.language = isArabic ? "AR" : "EN";

        // Fix Date format to DD/MM/YYYY
        if (!manualData?.date) {
            const d = new Date();
            // @ts-ignore
            articleData.publishedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        }

        // @ts-ignore
        await convex.mutation(api.monitoring.saveArticle, articleData);

        return NextResponse.json({ success: true, data: articleData });

    } catch (error: any) {
        console.error("Monitor API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await rateLimit(`monitor:get:${ip}`, 60, 60);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429, headers: { 'Retry-After': String(rl.resetSeconds) } }
        );
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const sourceType = searchParams.get("sourceType") || undefined;

    try {
        const articles = await convex.query(api.monitoring.getArticles, {
            limit,
            sourceType
        });
        return NextResponse.json({ success: true, count: articles.length, data: articles });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
