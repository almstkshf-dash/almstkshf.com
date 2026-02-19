"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

// ═══════════════════════════════════════════════════════════════════
// THE SPIDER — Inlined link resolver for Convex Node Runtime
// ═══════════════════════════════════════════════════════════════════
async function resolveUrl(originalUrl: string) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(originalUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5,ar;q=0.3',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
            },
            redirect: 'follow',
            signal: controller.signal,
        });

        clearTimeout(timeout);
        if (!response.ok) return null;

        const html = await response.text();
        const finalUrl = response.url;
        const $ = cheerio.load(html);

        const imageUrl = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');
        const siteName = $('meta[property="og:site_name"]').attr('content') || new URL(finalUrl).hostname;

        return { finalUrl, imageUrl, source: siteName };
    } catch (error) {
        console.warn(`⚠️ Spider failed to resolve: ${originalUrl}`, error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// GEMINI AI HELPER — With robust model fallback chain
// ═══════════════════════════════════════════════════════════════════
async function callGeminiForAnalysis(
    apiKey: string,
    title: string,
    snippet: string,
    keyword: string
): Promise<{
    sentiment: "Positive" | "Neutral" | "Negative";
    summary: string;
    sourceType: "Online News" | "Blog" | "Press Release" | "Social Media" | "Print";
    reach_estimate: number;
    tone?: string;
    risk?: "Low" | "Medium" | "High";
}> {
    const prompt = `Analyze this news article for media monitoring.

Title: "${title}"
Snippet: "${snippet}"
Monitoring Keyword: "${keyword}"

Return valid JSON ONLY with these exact fields:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "summary": "One concise sentence summary.",
  "sourceType": "Online News" | "Blog" | "Press Release" | "Social Media" | "Print",
  "reach_estimate": number,
  "tone": "short phrase describing tone",
  "risk": "Low" | "Medium" | "High"
}`;

    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];

    for (const model of models) {
        try {
            console.log(`🧠 Trying Gemini model: ${model}`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.3,
                            responseMimeType: "application/json",
                        },
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Model ${model} not found, trying next...`);
                    continue;
                }
                const errorBody = await response.text();
                console.error(`Gemini ${model} error: ${response.status} - ${errorBody.substring(0, 200)}`);
                continue;
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) { continue; }

            const parsed = JSON.parse(text.trim());

            const validSentiments = ["Positive", "Neutral", "Negative"];
            const validSourceTypes = ["Online News", "Blog", "Press Release", "Social Media", "Print"];

            return {
                sentiment: validSentiments.includes(parsed.sentiment) ? parsed.sentiment : "Neutral",
                summary: typeof parsed.summary === "string" ? parsed.summary : title,
                sourceType: validSourceTypes.includes(parsed.sourceType) ? parsed.sourceType : "Online News",
                reach_estimate: typeof parsed.reach_estimate === "number" ? parsed.reach_estimate : 50000,
                tone: typeof parsed.tone === "string" ? parsed.tone : "Analytical",
                risk: ["Low", "Medium", "High"].includes(parsed.risk) ? parsed.risk : "Medium",
            };
        } catch (error) {
            console.warn(`Gemini ${model} failed:`, error);
            continue;
        }
    }

    console.error("❌ All Gemini models failed. Using fallback values.");
    return {
        sentiment: "Neutral",
        summary: title,
        sourceType: "Online News",
        reach_estimate: 50000,
    };
}

// ═══════════════════════════════════════════════════════════════════
// THE BRAIN — Main fetchNews Action
// Supports: multi-country, multi-language, date-range, full-phrase
// ═══════════════════════════════════════════════════════════════════
export const fetchNews = action({
    args: {
        keyword: v.string(),
        countries: v.string(),     // comma-separated: "AE,SA,EG"
        languages: v.string(),     // comma-separated: "en,ar"
        dateFrom: v.optional(v.string()),  // DD/MM/YYYY
        dateTo: v.optional(v.string()),    // DD/MM/YYYY
    },
    handler: async (ctx, args) => {
        try {
            const apiKey = process.env.GEMINI_API_KEY?.trim();

            if (!apiKey) {
                console.error("❌ CRITICAL CONFIG ERROR: GEMINI_API_KEY is missing from Convex environment variables.");
                console.log("💡 Tip: Set this in the Convex Dashboard > Settings > Environment Variables.");
                return {
                    success: false,
                    error: "Media analysis service is not fully configured. Our team has been notified. (Error: CFG_MISSING)"
                };
            }

            const parser = new Parser();

            // Parse multi-values
            const countryList = args.countries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
            const languageList = args.languages.split(',').map(l => l.trim().toLowerCase()).filter(Boolean);

            // Parse date range if provided (DD/MM/YYYY → Date object)
            let dateFromObj: Date | null = null;
            let dateToObj: Date | null = null;
            if (args.dateFrom) {
                const [d, m, y] = args.dateFrom.split('/');
                dateFromObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            }
            if (args.dateTo) {
                const [d, m, y] = args.dateTo.split('/');
                dateToObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                dateToObj.setHours(23, 59, 59, 999); // End of day
            }

            // Full-phrase search — wrap in quotes for exact match on Google News
            const searchQuery = args.keyword.includes(' ')
                ? `"${args.keyword}"`
                : args.keyword;

            // Build RSS URL combos for each country × language pair
            const rssCombos: { url: string; country: string; lang: string }[] = [];

            for (const country of countryList) {
                for (const lang of languageList) {
                    const hl = `${lang}-${country}`;
                    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=${hl}&gl=${country}&ceid=${country}:${lang}`;
                    rssCombos.push({ url: rssUrl, country, lang });
                }
            }

            let totalSuccess = 0;
            let totalSkipped = 0;

            for (const combo of rssCombos) {
                console.log(`📡 Fetching RSS [${combo.lang}/${combo.country}]: ${combo.url}`);

                try {
                    const feed = await parser.parseURL(combo.url);
                    const items = feed.items.slice(0, 10);
                    console.log(`📰 Found ${feed.items.length} items for ${combo.lang}-${combo.country}, processing ${items.length}`);

                    for (const item of items) {
                        if (!item.link || !item.title) {
                            totalSkipped++;
                            continue;
                        }

                        try {
                            // Date range filter
                            if (dateFromObj || dateToObj) {
                                const pubDate = item.pubDate ? new Date(item.pubDate) : null;
                                if (pubDate) {
                                    if (dateFromObj && pubDate < dateFromObj) { totalSkipped++; continue; }
                                    if (dateToObj && pubDate > dateToObj) { totalSkipped++; continue; }
                                }
                            }

                            // SPIDER — Resolve URL
                            console.log(`🕷️ Resolving: ${item.title.substring(0, 50)}...`);
                            const resolved = await resolveUrl(item.link);

                            if (!resolved) {
                                // Still save with the original Google News URL — don't skip
                                console.log(`⚠️ Could not resolve, saving with original URL: ${item.link}`);
                            }

                            // BRAIN — AI Analysis via Gemini
                            const aiData = await callGeminiForAnalysis(
                                apiKey,
                                item.title,
                                item.contentSnippet || item.title,
                                args.keyword
                            );

                            // AVE Calculation — Formula: Reach × 0.02 × $5
                            const reach = aiData.reach_estimate || 50000;
                            const ave = Math.round(reach * 0.02 * 5);

                            // Format Date (DD/MM/YYYY)
                            const d = item.pubDate ? new Date(item.pubDate) : new Date();
                            const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

                            // Detect Language (Arabic character check)
                            const isArabic = /[\u0600-\u06FF]/.test(item.title + (item.contentSnippet || ""));
                            const language = isArabic ? "AR" : (combo.lang === "ar" ? "AR" : "EN");

                            // Save to Database
                            await ctx.runMutation(api.monitoring.saveArticle, {
                                keyword: args.keyword,
                                url: item.link,
                                resolvedUrl: resolved?.finalUrl || item.link,
                                publishedDate: formattedDate,
                                title: item.title,
                                content: aiData.summary || item.title,
                                language: language as "EN" | "AR",
                                sentiment: aiData.sentiment,
                                sourceType: aiData.sourceType,
                                sourceCountry: combo.country,
                                tone: aiData.tone,
                                risk: aiData.risk,
                                reach: reach,
                                ave: ave,
                                imageUrl: resolved?.imageUrl || undefined,
                            });

                            totalSuccess++;
                            console.log(`✅ Saved: ${item.title.substring(0, 40)}... [${aiData.sentiment}] [${language}] AVE=$${ave}`);

                        } catch (itemError) {
                            console.error(`❌ Failed to process article: ${item.title?.substring(0, 40)}`, itemError);
                            totalSkipped++;
                        }
                    }
                } catch (feedError: any) {
                    console.error(`❌ RSS fetch failed for ${combo.lang}-${combo.country}:`, feedError?.message);
                    totalSkipped++;
                }
            }

            console.log(`📊 Done: ${totalSuccess} saved, ${totalSkipped} skipped across ${rssCombos.length} feed(s)`);
            return { success: true, count: totalSuccess, skipped: totalSkipped, feeds: rssCombos.length };
        } catch (globalError: any) {
            console.error("🏁 CRITICAL: Global fetchNews failure", globalError);
            return {
                success: false,
                error: "Unable to process news monitoring at this time. Please try again later."
            };
        }
    },
});
