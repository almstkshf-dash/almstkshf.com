/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
// @ts-expect-error
import NewsAPI from 'newsapi';
import { requireAdmin } from "./utils/auth";
import { resolveApiKey } from "./utils/keys";
import { parseBooleanKeyword, matchesBooleanFilter, buildApiQuery } from "./utils/booleanFilter";
import { checkAndSetSeen } from "./utils/dedup";
import { sendResendEmail } from "./utils/email";
import { callWithAiRetry } from "./utils/aiRetry";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// THE SPIDER â€” Inlined link resolver for Convex Node Runtime
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
        console.warn(`âš ï¸ Spider failed to resolve: ${originalUrl}`, error);
        return null;
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GEMINI AI HELPER â€” With robust model fallback chain
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function callGeminiForAnalysis(
    apiKey: string | null,
    title: string,
    snippet: string,
    keyword: string,
    intendedCategories: string[] = []
): Promise<{
    sentiment: "Positive" | "Neutral" | "Negative";
    summary: string;
    sourceType: "Online News" | "Blog" | "Press Release" | "Social Media" | "Print";
    reach_estimate: number;
    tone?: string;
    risk?: "Low" | "Medium" | "High" | "Critical" | "critical";
    hashtags?: string[];
    emotions?: {
        joy: number;
        sadness: number;
        anger: number;
        fear: number;
        surprise: number;
        trust: number;
    };
}> {
    const prompt = `Analyze this content for media monitoring (can be News or Social Media) within the context of UAE and Saudi Arabian media and legal sectors.
IMPORTANT: Return the "summary" in the same language as the content (if Arabic, summary must be in Arabic).
Intended Categories (User Filter): ${intendedCategories.join(', ')}

Title/Author: "${title}"
Snippet/Text: "${snippet}"
Monitoring Keyword: "${keyword}"

Rules for Analysis:
1. For Social Media (Twitter/X): Consider emojis, common Arabic dialects (Gulf, Levantine, etc.), and informal language.
2. Sentiment: Detect the polarity towards the Monitoring Keyword. *IMPORTANT*: In the UAE/Saudi context, "Negative" sentiment must explicitly involve regulatory breaches, legal action, financial fraud, public boycotts, or direct reputational damage. Constructive criticism or routine operational updates should be classified as "Neutral".
3. Summary: Provide a one-sentence summary that highlights the main point.

Return valid JSON ONLY with these exact fields:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "summary": "One concise sentence summary in the content's primary language.",
  "sourceType": "Online News" | "Blog" | "Press Release" | "Social Media" | "Print",
  "reach_estimate": number,
  "tone": "short phrase describing tone (e.g., Sarcastic, Informative, Alarming)",
  "risk": "Low" | "Medium" | "High" | "Critical",
  "hashtags": ["list", "of", "relevant", "hashtags"],
  "emotions": {
    "joy": number (0-100),
    "sadness": number (0-100),
    "anger": number (0-100),
    "fear": number (0-100),
    "surprise": number (0-100),
    "trust": number (0-100)
  }
}
Note: The sum of emotions does not need to be 100, they are independent intensities. Joy/Sadness, Anger/Fear, Surprise/Expectation, Trust/Disgust are pairs. Focus on intensities.`;

    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const model of models) {
        try {
            if (!apiKey || apiKey === "None") break;
            console.log(`🧠 Trying Gemini model: ${model}`);

            const result = await callWithAiRetry<any>(async () => {
                return await fetch(
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
            }, { maxRetries: 2 });

            if (result.capacityExhausted) {
                console.warn(`⚠️ Model ${model} reports capacity exhaustion. Propagating retryAfter: ${result.retryAfter}s`);
                const err = new Error("MODEL_CAPACITY_EXHAUSTED");
                (err as any).retryAfter = result.retryAfter;
                throw err;
            }

            if (result.success && result.data) {
                const data = result.data;
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) continue;

                const parsed = JSON.parse(text.trim());
                const validSentiments = ["Positive", "Neutral", "Negative"];
                const validSourceTypes = ["Online News", "Blog", "Press Release", "Social Media", "Print"];

                return {
                    sentiment: (validSentiments.includes(parsed.sentiment) ? parsed.sentiment : "Neutral") as any,
                    summary: typeof parsed.summary === "string" ? parsed.summary : title,
                    sourceType: (validSourceTypes.includes(parsed.sourceType) ? parsed.sourceType : "Online News") as any,
                    reach_estimate: typeof parsed.reach_estimate === "number" ? parsed.reach_estimate : 50000,
                    tone: typeof parsed.tone === "string" ? parsed.tone : "Analytical",
                    risk: (["Low", "Medium", "High"].includes(parsed.risk) ? parsed.risk : "Medium") as any,
                    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
                    emotions: (parsed.emotions && typeof parsed.emotions === 'object') ? {
                        joy: typeof parsed.emotions.joy === 'number' ? parsed.emotions.joy : 0,
                        sadness: typeof parsed.emotions.sadness === 'number' ? parsed.emotions.sadness : 0,
                        anger: typeof parsed.emotions.anger === 'number' ? parsed.emotions.anger : 0,
                        fear: typeof parsed.emotions.fear === 'number' ? parsed.emotions.fear : 0,
                        surprise: typeof parsed.emotions.surprise === 'number' ? parsed.emotions.surprise : 0,
                        trust: typeof parsed.emotions.trust === 'number' ? parsed.emotions.trust : 0,
                    } : {
                        joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, trust: 0
                    }
                };
            }
        } catch (e: any) {
            if (e.message === "MODEL_CAPACITY_EXHAUSTED") throw e;
            console.warn(`⚠️ Model ${model} failed:`, e.message);
            continue;
        }
    }

    console.error("âŒ All Gemini models failed or key is missing. Using heuristic values.");

    // â”€â”€ HEURISTIC FALLBACK LOGIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const lowerText = (title + " " + snippet).toLowerCase();
    let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
    let risk: "Low" | "Medium" | "High" = "Medium";

    // EN/AR Positive keywords
    if (lowerText.match(/(growth|success|positive|profit|award|win|won|increase|expansion|partnership|launch|breakthrough|milestone|leader|innovative|Ù†Ø¬Ø§Ø­|Ø§Ø±Ø¨Ø§Ø­|ÙÙˆØ²|Ø§Ø²Ø¯Ù‡Ø§Ø±|Ù†Ù…Ùˆ|ØªØ·ÙˆØ±|Ø´Ø±Ø§ÙƒØ©|Ø§Ø·Ù„Ø§Ù‚|Ø§Ø¨ØªÙƒØ§Ø±)/i)) {
        sentiment = "Positive";
        risk = "Low";
    }
    // EN/AR Negative keywords (Colloquial + Formal + Harmful)
    else if (lowerText.match(/(Ù†ØµØ¨|Ø®Ø±Ø§Ø¨|Ø²ÙØª|ÙØ¶ÙŠØ­Ø©|ÙˆØ±Ø·Ø©|ØªØ¹ÙŠØ³|ÙØ§Ø´Ù„|Ø­Ø´ÙŠØ´|Ù…Ø§Ø±ÙŠØ¬ÙˆØ§Ù†Ø§|ÙƒØ±ÙŠØ³ØªØ§Ù„|ÙƒÙˆÙƒ|ØªØ±Ø§Ù…Ø§Ø¯ÙˆÙ„|Ù„Ø§Ø±ÙŠÙƒØ§|Ø³ÙŠ Ø¨ÙŠ Ø¯ÙŠ|loss|decline|negative|drop|decrease|fail|scandal|breach|lawsuit|violation|fraud|crisis|warning|risk|hashish|weed|cocauine|teramadol|larica|massage in dubai|happy ending|cristal mith|escort girls|harm|harmfull|CBD OIL|Ø®Ø³Ø§Ø±Ø©|ØªØ±Ø§Ø¬Ø¹|ÙØ´Ù„|ÙØ¶ÙŠØ­Ø©|Ø§Ø®ØªØ±Ø§Ù‚|Ø¯Ø¹ÙˆÙ‰|Ø§Ù†ØªÙ‡Ø§Ùƒ|Ø§Ø­ØªÙŠØ§Ù„|Ø§Ø²Ù…Ø©|ØªØ­Ø°ÙŠØ±|Ø®Ø·Ø±)/i)) {
        sentiment = "Negative";
        risk = "High";
    }

    const reach_estimate = lowerText.includes("twitter.com") || lowerText.includes("reddit.com") ? 15000 : 50000;

    return {
        sentiment,
        summary: snippet.substring(0, 200).trim() + "...",
        sourceType: lowerText.includes("twitter.com") || lowerText.includes("x.com") ? "Social Media" : "Online News",
        reach_estimate,
        tone: sentiment === "Positive" ? "Optimistic" : (sentiment === "Negative" ? "Concerning" : "Informative"),
        risk,
        hashtags: [],
        emotions: {
            joy: sentiment === "Positive" ? 60 : 0,
            sadness: sentiment === "Negative" ? 40 : 0,
            anger: sentiment === "Negative" ? 30 : 0,
            fear: sentiment === "Negative" ? 50 : 0,
            surprise: 20,
            trust: sentiment === "Positive" ? 70 : 30
        }
    };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GEMINI RELEVANCY GATE â€” Returns 0-100 relevancy score
// Articles scoring below RELEVANCY_THRESHOLD are discarded before DB write.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const RELEVANCY_THRESHOLD = 85;

async function callGeminiRelevancyScore(
    apiKey: string | null,
    title: string,
    snippet: string,
    keyword: string
): Promise<number> {
    const prompt = `You are a media monitoring relevancy judge.
Keyword being monitored: "${keyword}"
Article Title: "${title}"
Article Snippet: "${snippet.substring(0, 500)}"

Score how relevant this article is to the monitoring keyword on a scale of 0 to 100.
- 100 = the article is directly and substantially about the keyword
- 95+ = clearly relevant, keyword is a main topic
- 85-94 = tangentially related, keyword mentioned briefly
- 0-84 = not relevant, keyword appears incidentally or not at all

Return valid JSON ONLY:
{"relevancy_score": <number 0-100>, "reason": "<one sentence>"}` ;

    if (!apiKey) return 100; // Fail-open (pass) if no key

    // Use the fastest available model for this quick gate
    const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const model of models) {
        try {
            const result = await callWithAiRetry<any>(async () => {
                return await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.1,
                                responseMimeType: "application/json",
                            },
                        }),
                    }
                );
            }, { maxRetries: 1 });

            if (result.capacityExhausted) {
                const err = new Error("MODEL_CAPACITY_EXHAUSTED");
                (err as any).retryAfter = result.retryAfter;
                throw err;
            }

            if (result.success && result.data) {
                const data = result.data;
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) continue;

                const parsed = JSON.parse(text.trim());
                const score = typeof parsed.relevancy_score === "number" ? parsed.relevancy_score : 100;
                console.log(`🎯 Relevancy [${score}/100] — ${parsed.reason || ""} — "${title.substring(0, 50)}"`);
                return score;
            }
        } catch (e: any) {
            if (e.message === "MODEL_CAPACITY_EXHAUSTED") throw e;
            console.warn(`⚠️ Relevancy check failed for ${model}:`, e.message);
            continue;
        }
    }

    return 100; // Fail-open if all models fail
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// THE BRAIN â€” Main fetchNews Action
// Supports: multi-country, multi-language, date-range, full-phrase
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const fetchNews = action({
    args: {
        keyword: v.string(),
        countries: v.string(),     // comma-separated: "AE,SA,EG"
        languages: v.string(),     // comma-separated: "en,ar"
        sourceTypes: v.optional(v.string()), // comma-separated: "Online News,Press Release"
        dateFrom: v.optional(v.string()),  // DD/MM/YYYY
        dateTo: v.optional(v.string()),    // DD/MM/YYYY
    },
    handler: async (ctx, args): Promise<{ success: boolean; count?: number; skipped?: number; feeds?: number; error?: string; capacityExhausted?: boolean; retryAfter?: number }> => {
        try {
            // Check if user is admin
            await requireAdmin(ctx.auth);
            const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            if (!apiKey) {
                console.warn("âš ï¸ Gemini API key is missing. Falling back to Heuristic Engine for analysis.");
            }

            console.log("🔍 [fetchNews] Starting resolution...");
            const newsdataKey = await resolveApiKey(ctx, "NEWSDATA_API_KEY", "newsdata");
            const newsapiKey = await resolveApiKey(ctx, "NEWSAPI_API_KEY", "newsapi");
            const gnewsKey = await resolveApiKey(ctx, "GNEWS_API_KEY", "gnews");
            const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
            const twitterBearer = await resolveApiKey(ctx, "X_BEARER_TOKEN", "twitterBearer");
            const bingKey = await resolveApiKey(ctx, "BING_API_KEY", "bing");
            const mediastackKey = await resolveApiKey(ctx, "MEDIASTACK_API_KEY", "mediastack");
            const serperKey = await resolveApiKey(ctx, "SERPER_API_KEY", "serper");
            const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            console.log(`🔑 Keys: NewsData:${!!newsdataKey}, GNews:${!!gnewsKey}, WorldNews:${!!worldnewsKey}, Gemini:${!!geminiKey}`);

            const providers = [
                { name: 'NewsData.io', key: newsdataKey, type: 'newsdata' },
                { name: 'NewsAPI.org', key: newsapiKey, type: 'newsapi' },
                { name: 'GNews.io', key: gnewsKey, type: 'gnews' },
                { name: 'WorldNews API', key: worldnewsKey, type: 'worldnews' },
                { name: 'Twitter (X)', key: twitterBearer, type: 'twitter' },
                { name: 'Bing News', key: bingKey, type: 'bing' },
                { name: 'Mediastack', key: mediastackKey, type: 'mediastack' },
                { name: 'Serper.dev', key: serperKey, type: 'serper' }
            ].filter(p => p.key);

            if (providers.length === 0) {
                return { success: false, error: "Missing news provider API keys. Please configure at least one in Settings." };
            }

            const parser = new Parser({ timeout: 10000 });

            // Parse multi-values
            const countryList = args.countries.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
            const languageList = args.languages.split(',').map(l => l.trim().toLowerCase()).filter(Boolean);

            // Parse date range if provided (DD/MM/YYYY â†’ Date object)
            let dateFromObj: Date | null = null;
            let dateToObj: Date | null = null;
            if (args.dateFrom) {
                const parts = args.dateFrom.split('/');
                if (parts.length === 3) {
                    const [d, m, y] = parts;
                    dateFromObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                    if (isNaN(dateFromObj.getTime())) dateFromObj = null;
                }
            }
            if (args.dateTo) {
                const parts = args.dateTo.split('/');
                if (parts.length === 3) {
                    const [d, m, y] = parts;
                    dateToObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                    if (isNaN(dateToObj.getTime())) {
                        dateToObj = null;
                    } else {
                        dateToObj.setHours(23, 59, 59, 999);
                    }
                }
            }

            // Full-phrase search â€” wrap in quotes for exact match on Google News
            // We use buildApiQuery to get a "clean" version for the API, 
            // but for RSS we might want to keep the enriched logic.
            const cleanQuery = buildApiQuery(args.keyword);
            let enrichedQuery = cleanQuery.includes(' ') ? `"${cleanQuery}"` : cleanQuery;

            // Source Type targeting
            const stList = args.sourceTypes ? args.sourceTypes.split(',').map(s => s.trim()) : [];
            if (stList.includes('Press Release')) {
                enrichedQuery += ' (site:prnewswire.com OR site:businesswire.com OR site:zawya.com OR site:wam.ae OR site:globenewswire.com OR site:einpresswire.com OR site:accesswire.com OR site:me-newswire.net OR site:spa.gov.sa OR site:newsfilecorp.com OR site:prweb.com OR site:marketwired.com OR site:prunderground.com OR site:eyeofriyadh.com OR site:eyeofdubai.ae OR site:saudigazette.com.sa OR site:arabnews.com OR site:gulfnews.com)';
            } else if (stList.includes('Social Media')) {
                enrichedQuery += ' (site:twitter.com OR site:reddit.com OR site:linkedin.com)';
            }

            // Enhance query with date operators for exact matching
            if (dateFromObj && !isNaN(dateFromObj.getTime())) {
                const after = dateFromObj.toISOString().split('T')[0];
                enrichedQuery += ` after:${after}`;
            }
            if (dateToObj && !isNaN(dateToObj.getTime())) {
                const before = dateToObj.toISOString().split('T')[0];
                enrichedQuery += ` before:${before}`;
            }

            // 1. FETCH FROM GOOGLE NEWS (RSS)
            const rssCombos: { url: string; country: string; lang: string }[] = [];
            for (const country of countryList) {
                for (const lang of languageList) {
                    const hl = `${lang}-${country.toUpperCase()}`;
                    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}&hl=${hl}&gl=${country.toUpperCase()}&ceid=${country.toUpperCase()}:${lang}`;
                    rssCombos.push({ url: rssUrl, country: country.toUpperCase(), lang });
                }
            }


            let totalSuccess = 0;
            const totalSkipped = 0;

            // ————————————————— Parallel Provider Fetching ———————————————————————————————————————————————
            console.log(`🚀 Starting parallel fetch for keyword: ${args.keyword}`);

            const fetchPromises = [];

            // 1. Google News (RSS)
            for (const combo of rssCombos) {
                fetchPromises.push((async () => {
                    try {
                        console.log(`📡 [RSS] Fetching: ${combo.url.substring(0, 100)}...`);
                        const feed = await parser.parseURL(combo.url);
                        console.log(`✅ [RSS] Got ${feed.items?.length || 0} items from ${combo.country}-${combo.lang}`);
                        const items = feed.items.slice(0, 10);
                        let localSuccess = 0;
                        for (const item of items) {
                            try {
                                const success = await processArticle(ctx, item, combo.country, combo.lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, true);
                                if (success) localSuccess++;
                            } catch (e: any) {
                                if (e.message === "MODEL_CAPACITY_EXHAUSTED") {
                                    throw e; // Bubble up to stop the action
                                }
                            }
                        }
                        return { name: `RSS-${combo.country}`, success: localSuccess };
                    } catch (e) {
                        console.error(`âŒ RSS fail: ${combo.url}`, e);
                        return { name: `RSS-${combo.country}`, error: true };
                    }
                })());
            }

            // 2. NewsData.io
            if (newsdataKey) {
                fetchPromises.push((async () => {
                    try {
                        const ndUrl = `https://newsdata.io/api/1/latest?apikey=${newsdataKey}&q=${encodeURIComponent(cleanQuery)}&language=${languageList.join(',')}&country=${countryList.join(',')}`;
                        const ndRes = await fetch(ndUrl);
                        if (ndRes.ok) {
                            const ndData = await ndRes.json();
                            if (ndData.status === "success" && ndData.results) {
                                let localSuccess = 0;
                                for (const item of ndData.results) {
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.link,
                                        pubDate: item.pubDate,
                                        contentSnippet: `Source: ${item.source_id || 'Unknown'}. ${item.description || item.content || item.title}`,
                                        imageUrl: item.image_url
                                    }, (item.country?.[0] || countryList[0]).toUpperCase(), item.language || languageList[0], args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: 'NewsData.io', success: localSuccess };
                            }
                        }
                        return { name: 'NewsData.io', error: true };
                    } catch (e) {
                        console.error(`âŒ NewsData.io fail`, e);
                        return { name: 'NewsData.io', error: true };
                    }
                })());
            }

            // 3. NewsAPI.org
            if (newsapiKey) {
                fetchPromises.push((async () => {
                    try {
                        const naClient = new NewsAPI(newsapiKey);
                        const naDateFrom = dateFromObj ? dateFromObj.toISOString().split('T')[0] : undefined;
                        const naDateTo = dateToObj ? dateToObj.toISOString().split('T')[0] : undefined;
                        let localSuccess = 0;

                        for (const lang of languageList) {
                            const response = await naClient.v2.everything({
                                q: cleanQuery,
                                language: lang as "en" | "ar",
                                from: naDateFrom,
                                to: naDateTo,
                                sortBy: 'publishedAt',
                                pageSize: 20
                            });

                            if (response.status === "ok" && response.articles) {
                                for (const item of response.articles) {
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.url,
                                        pubDate: item.publishedAt,
                                        contentSnippet: `Source: ${item.source?.name || 'Unknown'}. ${item.description || item.content || item.title}`,
                                        imageUrl: item.urlToImage
                                    }, (countryList[0] || "AE").toUpperCase(), lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                            }
                        }
                        return { name: 'NewsAPI.org', success: localSuccess };
                    } catch (e) {
                        console.error(`âŒ NewsAPI.org fail`, e);
                        return { name: 'NewsAPI.org', error: true };
                    }
                })());
            }

            // 4. GNews.io
            if (gnewsKey) {
                fetchPromises.push((async () => {
                    try {
                        const gDateFrom = dateFromObj ? dateFromObj.toISOString().split('.')[0] + 'Z' : "";
                        const gDateTo = dateToObj ? dateToObj.toISOString().split('.')[0] + 'Z' : "";
                        let localSuccess = 0;

                        for (const lang of languageList) {
                            for (const country of countryList) {
                                let gQuery = cleanQuery.trim();
                                if (gQuery.includes(' ') && !gQuery.startsWith('"')) gQuery = `"${gQuery}"`;
                                gQuery = gQuery.substring(0, 200);

                                let gUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(gQuery)}&lang=${lang}&country=${country}&max=20&apikey=${gnewsKey}&sortby=publishedAt&nullable=description,image`;
                                if (gDateFrom) gUrl += `&from=${gDateFrom}`;
                                if (gDateTo) gUrl += `&to=${gDateTo}`;

                                const gRes = await fetch(gUrl);
                                if (gRes.ok) {
                                    const gData = await gRes.json();
                                    if (gData.articles) {
                                        for (const item of gData.articles) {
                                            const success = await processArticle(ctx, {
                                                title: item.title,
                                                link: item.url,
                                                pubDate: item.publishedAt,
                                                contentSnippet: `Source: ${item.source?.name || 'Unknown'}. ${item.description || item.content || item.title}`,
                                                imageUrl: item.image
                                            }, country.toUpperCase(), lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                            if (success) localSuccess++;
                                        }
                                    }
                                }
                            }
                        }
                        return { name: 'GNews.io', success: localSuccess };
                    } catch (e) {
                        console.error(`âŒ GNews.io fail`, e);
                        return { name: 'GNews.io', error: true };
                    }
                })());
            }

            // 5. WorldNews API
            if (worldnewsKey) {
                fetchPromises.push((async () => {
                    try {
                        const wnDateFrom = dateFromObj ? dateFromObj.toISOString().replace('T', ' ').split('.')[0] : "";
                        let wnKeyword = cleanQuery.trim();
                        if (wnKeyword.includes(' ') && !wnKeyword.startsWith('"')) wnKeyword = `"${wnKeyword}"`;
                        wnKeyword = wnKeyword.substring(0, 100);
                        const country = (countryList[0] || 'ae').toLowerCase();

                        let wnUrl = `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(wnKeyword)}&language=${languageList.join(',')}&source-country=${country}&number=20&sort=publish-time&sort-direction=DESC`;
                        if (wnDateFrom) wnUrl += `&earliest-publish-date=${wnDateFrom}`;

                        const wnRes = await fetch(wnUrl, { headers: { 'x-api-key': worldnewsKey } });
                        if (wnRes.ok) {
                            const wnData = await wnRes.json();
                            if (wnData.news) {
                                let localSuccess = 0;
                                for (const item of wnData.news) {
                                    const authorStr = Array.isArray(item.authors) ? item.authors.join(', ') : (item.author || 'Unknown');
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.url,
                                        pubDate: item.publish_date,
                                        contentSnippet: `Source: ${authorStr}. ${item.text || item.title}`,
                                        imageUrl: item.image
                                    }, (item.source_country || country).toUpperCase(), item.language || languageList[0], args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: 'WorldNews API', success: localSuccess };
                            }
                        }
                        return { name: 'WorldNews API', error: true };
                    } catch (e) {
                        console.error(`âŒ WorldNews API fail`, e);
                        return { name: 'WorldNews API', error: true };
                    }
                })());
            }

            // 6. Twitter (X)
            if (twitterBearer) {
                fetchPromises.push((async () => {
                    try {
                        const txQuery = encodeURIComponent(cleanQuery);
                        const txUrl = `https://api.twitter.com/2/tweets/search/recent?query=${txQuery}&max_results=20&tweet.fields=created_at,author_id,entities,public_metrics&expansions=author_id`;
                        const txRes = await fetch(txUrl, { headers: { 'Authorization': `Bearer ${twitterBearer}` } });

                        if (txRes.ok) {
                            const txData = await txRes.json();
                            if (txData.data) {
                                let localSuccess = 0;
                                for (const tweet of txData.data) {
                                    const author = txData.includes?.users?.find((u: any) => u.id === tweet.author_id)?.username || tweet.author_id;
                                    const success = await processArticle(ctx, {
                                        title: `Tweet by @${author}`,
                                        link: `https://twitter.com/${author}/status/${tweet.id}`,
                                        pubDate: tweet.created_at,
                                        contentSnippet: `Source: Twitter (@${author}). ${tweet.text}`,
                                        imageUrl: null,
                                        likes: tweet.public_metrics?.like_count,
                                        retweets: tweet.public_metrics?.retweet_count,
                                        replies: tweet.public_metrics?.reply_count
                                    }, (countryList[0] || 'ae').toUpperCase(), languageList[0], args.keyword, apiKey, stList, dateFromObj, dateToObj, false, "Social Media");
                                    if (success) localSuccess++;
                                }
                                return { name: 'Twitter (X)', success: localSuccess };
                            }
                        }
                        return { name: 'Twitter (X)', error: true };
                    } catch (e) {
                        console.error(`âŒ Twitter fail`, e);
                        return { name: 'Twitter (X)', error: true };
                    }
                })());
            }

            // 7. Bing News
            if (bingKey) {
                fetchPromises.push((async () => {
                    try {
                        const country = (countryList[0] || 'us').toUpperCase();
                        const lang = languageList[0] || 'en';
                        const bingUrl = `https://api.bing.microsoft.com/v7.0/news/search?q=${encodeURIComponent(cleanQuery)}&setLang=${lang}&cc=${country}&mkt=${lang}-${country}&count=20`;
                        const bingRes = await fetch(bingUrl, { headers: { 'Ocp-Apim-Subscription-Key': bingKey } });

                        if (bingRes.ok) {
                            const bingData = await bingRes.json();
                            if (bingData.value) {
                                let localSuccess = 0;
                                for (const item of bingData.value) {
                                    const success = await processArticle(ctx, {
                                        title: item.name,
                                        link: item.url,
                                        pubDate: item.datePublished,
                                        contentSnippet: `Source: ${item.provider?.[0]?.name || 'Unknown'}. ${item.description || item.name}`,
                                        imageUrl: item.image?.thumbnail?.contentUrl
                                    }, country, lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: 'Bing News', success: localSuccess };
                            }
                        }
                        return { name: 'Bing News', error: true };
                    } catch (e) {
                        console.error(`âŒ Bing News fail`, e);
                        return { name: 'Bing News', error: true };
                    }
                })());
            }

            // 8. Mediastack
            if (mediastackKey) {
                fetchPromises.push((async () => {
                    try {
                        const msUrl = `http://api.mediastack.com/v1/news?access_key=${mediastackKey}&keywords=${encodeURIComponent(cleanQuery)}&languages=${languageList.join(',')}&countries=${countryList.join(',')}&limit=20`;
                        const msRes = await fetch(msUrl);
                        if (msRes.ok) {
                            const msData = await msRes.json();
                            if (msData.data) {
                                let localSuccess = 0;
                                for (const item of msData.data) {
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.url,
                                        pubDate: item.published_at,
                                        contentSnippet: `Source: ${item.source || 'Unknown'}. ${item.description || item.title}`,
                                        imageUrl: item.image
                                    }, (item.country || countryList[0]).toUpperCase(), item.language || languageList[0], args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: 'Mediastack', success: localSuccess };
                            }
                        }
                        return { name: 'Mediastack', error: true };
                    } catch (e) {
                        console.error(`âŒ Mediastack fail`, e);
                        return { name: 'Mediastack', error: true };
                    }
                })());
            }

            // 9. Serper.dev (Google News via Serper)
            if (serperKey) {
                fetchPromises.push((async () => {
                    try {
                        const serperUrl = `https://google.serper.dev/news`;
                        const serperRes = await fetch(serperUrl, {
                            method: 'POST',
                            headers: {
                                'X-API-KEY': serperKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                q: cleanQuery,
                                gl: countryList[0] || 'us',
                                hl: languageList[0] || 'en',
                                num: 20
                            })
                        });

                        if (serperRes.ok) {
                            const serperData = await serperRes.json();
                            if (serperData.news) {
                                let localSuccess = 0;
                                for (const item of serperData.news) {
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.link,
                                        pubDate: item.date,
                                        contentSnippet: `Source: ${item.source || 'Unknown'}. ${item.snippet || item.title}`,
                                        imageUrl: item.imageUrl
                                    }, (countryList[0] || 'us').toUpperCase(), languageList[0] || 'en', args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: 'Serper.dev', success: localSuccess };
                            }
                        }
                        return { name: 'Serper.dev', error: true };
                    } catch (e) {
                        console.error(`âŒ Serper.dev fail`, e);
                        return { name: 'Serper.dev', error: true };
                    }
                })());
            }

            // 10. GLEIF (Corporate Intelligence / Entity Lookups)
            fetchPromises.push((async () => {
                try {
                    // GLEIF is public, no key needed.
                    const gleifUrl = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(cleanQuery)}&page[size]=5`;
                    const gleifRes = await fetch(gleifUrl);
                    if (gleifRes.ok) {
                        const gleifData = await gleifRes.json();
                        const records = gleifData?.data || [];
                        if (records.length > 0) {
                            // Instead of processing as an article, we'll store this as an OSINT result specifically for this keyword.
                            await ctx.runMutation(api.osintDb.saveOsintResult, {
                                type: "gleif" as any,
                                query: cleanQuery,
                                result: {
                                    source: "monitoring_pipeline",
                                    records: records.map((r: any) => ({
                                        lei: r.attributes?.lei,
                                        legalName: r.attributes?.entity?.legalName?.name,
                                        status: r.attributes?.registration?.registrationStatus,
                                        jurisdiction: r.attributes?.entity?.jurisdiction,
                                    }))
                                }
                            });
                            return { name: 'GLEIF', success: 1 };
                        }
                    }
                    return { name: 'GLEIF', success: 0 };
                } catch (e) {
                    console.error(`âŒ GLEIF fail`, e);
                    return { name: 'GLEIF', error: true };
                }
            })());

            const results = await Promise.all(fetchPromises);
            results.forEach(r => {
                if ('success' in r) totalSuccess += r.success || 0;
            });

            console.log(`ðŸ“Š Parallel Fetch Complete: ${totalSuccess} saved articles.`);
            return { success: true, count: totalSuccess, skipped: totalSkipped, feeds: results.length };
        } catch (globalError: any) {
            if (globalError.message === "MODEL_CAPACITY_EXHAUSTED") {
                console.warn(`âš ï¸  Terminating fetchNews early due to AI capacity exhaustion. Retry after ${globalError.retryAfter}s`);
                return {
                    success: false,
                    error: "AI_CAPACITY_EXHAUSTED",
                    capacityExhausted: true,
                    retryAfter: globalError.retryAfter || 60
                };
            }
            console.error("ðŸ CRITICAL: Global fetchNews failure", globalError);
            const errorMessage = globalError instanceof Error ? globalError.message : String(globalError);
            const stack = globalError instanceof Error ? globalError.stack : "No stack trace";
            return {
                success: false,
                error: `Unable to process news monitoring: ${errorMessage} | Stack: ${stack}`
            };


        }
    },
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// THE EXTRACTOR â€” Direct URL to Article Extraction
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const extractArticle = action({
    args: {
        url: v.string(),
        analyze: v.optional(v.boolean()),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: any; error?: string }> => {
        try {
            const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
            if (!worldnewsKey) {
                return { success: false, error: "Missing WorldNews API key. Configure in Settings." };
            }

            const result = await extractWithWorldNews(args.url, worldnewsKey, args.analyze || false);
            return { success: !!result, data: result };
        } catch (error) {
            console.error("âŒ Extract error:", error);
            return { success: false, error: "Failed to extract article content." };
        }
    }
});

async function extractWithWorldNews(url: string, apiKey: string, analyze: boolean = false) {
    try {
        const extractUrl = `https://api.worldnewsapi.com/extract-news?url=${encodeURIComponent(url)}&analyze=${analyze}`;
        const res = await fetch(extractUrl, {
            headers: { 'x-api-key': apiKey }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error("âŒ WorldNews Extract fail", e);
        return null;
    }
}

// Helper to avoid code duplication
const VALID_SOURCE_TYPES = ["Online News", "Social Media", "Blog", "Print", "Press Release"] as const;
type ValidSourceType = typeof VALID_SOURCE_TYPES[number];

function sanitizeSourceType(val: string | undefined): ValidSourceType {
    if (val && VALID_SOURCE_TYPES.includes(val as ValidSourceType)) return val as ValidSourceType;
    return "Online News";
}

async function processArticle(
    ctx: any,
    item: any,
    country: string,
    lang: string,
    keyword: string,
    geminiKey: string | null,
    stList: string[],
    dateFrom: Date | null,
    dateTo: Date | null,
    shouldResolve: boolean,
    forceSourceType?: string
) {
    if (typeof item.link !== "string" || typeof item.title !== "string") return false;

    try {
        // â”€â”€ GATE 1: Boolean Pre-Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Evaluates mandatory (+), excluded (-), and phrase terms BEFORE any
        // API call. Zero cost â€” pure string matching.
        const boolExpr = parseBooleanKeyword(keyword);
        const snippet = item.contentSnippet || item.content || item.title;
        if (!matchesBooleanFilter(boolExpr, item.title, snippet)) {
            console.log(`âš¡ Boolean reject: "${item.title.substring(0, 60)}..."`);
            return false;
        }

        // â”€â”€ GATE 2: Date Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (pubDate) {
            if (dateFrom && pubDate < dateFrom) return false;
            if (dateTo && pubDate > dateTo) return false;
        }

        // â”€â”€ GATE 3: Redis Deduplication (24-hour hash cache) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Prevents the same article from multiple providers (NewsData, GNews,
        // RSS) being stored twice. Uses SHA-256(url+title) with 24h TTL.
        const isDuplicate = await checkAndSetSeen(item.link, item.title);
        if (isDuplicate) {
            return false; // Log already printed inside checkAndSetSeen
        }

        // â”€â”€ GATE 4: Gemini Relevancy Score (â‰¥70 required) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // Lightweight Gemini call to score how relevant the article is to the
        // keyword. Articles scoring below 70/100 are discarded before the
        // full analysis + DB write.
        const relevancyScore = await callGeminiRelevancyScore(
            geminiKey,
            item.title,
            snippet,
            keyword
        );
        if (relevancyScore < RELEVANCY_THRESHOLD) {
            console.log(`âš ï¸ Low relevancy (${relevancyScore}/100) â€” discarded: "${item.title.substring(0, 60)}"`);
            return false;
        }

        // â”€â”€ RESOLVE: Spider â€” Resolve URL if needed (RSS redirects) â”€â”€â”€â”€â”€â”€â”€
        let resolvedUrl = item.link;
        let imageUrl = item.imageUrl;
        let sourceName = item.source || item.creator;

        if (shouldResolve) {
            console.log(`ðŸ•·ï¸ Resolving: ${item.title.substring(0, 50)}...`);
            const resolved = await resolveUrl(item.link);
            if (resolved) {
                resolvedUrl = resolved.finalUrl;
                imageUrl = resolved.imageUrl || imageUrl;
                sourceName = resolved.source || sourceName;
            }
        }

        // â”€â”€ ANALYSE: Full Gemini Sentiment Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const aiData = await callGeminiForAnalysis(
            geminiKey,
            item.title,
            snippet,
            keyword,
            stList
        );

        const reach = aiData.reach_estimate || 50000;
        const ave = Math.round(reach * 0.02 * 5);
        const d = pubDate || new Date();
        const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

        const isArabic = /[\u0600-\u06FF]/.test(item.title + snippet);
        const language = isArabic ? "AR" : (lang === "ar" ? "AR" : "EN");

        const depth = (aiData.risk === "High" || aiData.risk === "Critical" || aiData.risk === "critical") ? "deep" : "standard";

        await ctx.runMutation(api.monitoring.saveArticle, {
            keyword,
            url: item.link,
            resolvedUrl: resolvedUrl,
            publishedDate: formattedDate,
            title: item.title,
            content: aiData.summary || item.title,
            language: language as "EN" | "AR",
            sentiment: aiData.sentiment,
            sourceType: sanitizeSourceType(forceSourceType || aiData.sourceType),
            sourceCountry: country,
            source: sourceName || new URL(resolvedUrl || item.link).hostname,
            tone: aiData.tone,
            risk: aiData.risk,
            reach: reach,
            ave: ave,
            imageUrl: imageUrl,
            likes: item.likes,
            retweets: item.retweets,
            replies: item.replies,
            relevancy_score: relevancyScore,
            hashtags: aiData.hashtags,
            emotions: aiData.emotions,
            depth,
        });

        // --- Deep Enrichment ---
        if (depth === "deep") {
            console.log(`ðŸ” [Deep Promotion] Article for "${keyword}" promoted to Deep Analysis. Triggering enrichment...`);
            // We trigger these in the background. Note: lookupNews/searchAhmia were updated to support identity-less calls.
            ctx.runAction(api.osint.lookupNews, { query: keyword }).catch(console.error);
            ctx.runAction(api.darkWeb.searchAhmia, { query: keyword }).catch(console.error);
        }

        const userId = "system"; // Background monitoring defaults to system
        const finalUserId = userId;
        const isPressRelease = forceSourceType === "Press Release" || aiData.sourceType === "Press Release";
        const isCritical = aiData.risk === "High" || aiData.risk === "Critical" || aiData.risk === "critical" || aiData.sentiment === "Negative";

        if (isCritical || isPressRelease) {
            try {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId: finalUserId,
                    title: isCritical ? "critical_mention" : "press_release_found",
                    message: `${isPressRelease ? "[Press Release] " : ""}Mention for "${keyword}": ${item.title.substring(0, 60)}...`,
                    type: isCritical ? "alert" : "system"
                });

                if (isCritical) {
                    const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "k.account@almstkshf.com";
                    await sendResendEmail({
                        to: CONTACT_EMAIL,
                        subject: `Urgent Alert: High Risk Mention for "${keyword}"`,
                        html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                                    <div style="background-color: #ef4444; padding: 15px; border-radius: 8px 8px 0 0; color: white;">
                                        <h2 style="margin: 0;">ALMSTKSHF Critical Alert</h2>
                                    </div>
                                    <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                                        <p style="margin-top: 0;"><strong>Keyword:</strong> ${keyword}</p>
                                        <p><strong>Risk Level:</strong> <span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${aiData.risk}</span></p>
                                        <p><strong>Sentiment:</strong> <span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${aiData.sentiment}</span></p>
                                        
                                        <h3 style="margin-top: 20px;">Article Title</h3>
                                        <p style="background: #f8fafc; padding: 10px; border-radius: 4px;">${item.title}</p>
                                        
                                        <h3>AI Summary</h3>
                                        <p style="line-height: 1.5;">${aiData.summary || "No summary provided."}</p>
                                        
                                        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                                            <a href="${item.link}" style="background-color: #0f172a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Article</a>
                                        </div>
                                    </div>
                                </div>
                            `
                    });
                }
            } catch (emailErr) {
                console.error("[Email Alert] Failed:", emailErr);
            }
        }
    } catch (error) {
        console.error(`❌ Article processing failed for "${item.link}":`, error);
        return false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// HISTORICAL SEARCH — NewsAPI.org for archives beyond RSS feed retention
// ─────────────────────────────────────────────────────────────────────────────────────────
/**
 * Fetches historical news articles from NewsAPI.org when RSS feeds don't have enough historical data.
 */
async function fetchHistoricalArticles(
    ctx: any,
    keyword: string,
    dateFrom: string | null,
    dateTo: string | null,
    limit: number = 30
): Promise<Array<{ link: string; title: string; contentSnippet: string; pubDate: string; source: string }>> {
    const newsApiKey = await resolveApiKey(ctx, "NEWSAPI_KEY", "newsapi");
    if (!newsApiKey) return [];

    try {
        const query = encodeURIComponent(keyword);
        let url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=${Math.min(limit, 100)}&apiKey=${newsApiKey}`;
        if (dateFrom) url += `&from=${dateFrom}`;
        if (dateTo) url += `&to=${dateTo}`;

        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        if (!data.articles || !Array.isArray(data.articles)) return [];

        return data.articles.map((article: any) => ({
            link: article.url,
            title: article.title,
            contentSnippet: article.description || article.content || article.title,
            pubDate: article.publishedAt,
            source: article.source?.name || "NewsAPI"
        }));
    } catch (error) {
        console.warn("[Historical Search] Error fetching from NewsAPI:", error);
        return [];
    }
}

async function fetchRobustRss(url: string) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5,ar;q=0.3',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
        }

        let xml = await response.text();
        // Sanitization for AETOSWire and others with potential malformed XML
        xml = xml.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/g, "");
        return xml;
    } catch (error: any) {
        throw error;
    }
}

const PR_WIRE_FEEDS = [
    { name: "PR Newswire", url: "https://www.prnewswire.com/rss/news-releases-news.rss", country: "US", lang: "en" },
    { name: "Newswire_com", url: "https://www.newswire.com/newsroom/rss/all", country: "US", lang: "en" },
    { name: "AETOSWire", url: "https://www.aetoswire.com/en/rss", country: "AE", lang: "en" },
    { name: "WAM", url: "https://wam.ae/en/rss/all", country: "AE", lang: "en" },
    { name: "Zawya", url: "https://www.zawya.com/en/rss/all", country: "AE", lang: "en" },
    { name: "Arab News", url: "https://www.arabnews.com/rss.xml", country: "SA", lang: "en" },
    { name: "Gulf News", url: "https://gulfnews.com/rss", country: "AE", lang: "en" },
    { name: "Khaleej Times", url: "https://www.khaleejtimes.com/rss", country: "AE", lang: "en" },
    { name: "The National", url: "https://www.thenationalnews.com/rss", country: "AE", lang: "en" },
    { name: "Middle East Eye", url: "https://www.middleeasteye.net/rss", country: "GB", lang: "en" },
    { name: "Al Bawaba", url: "https://www.albawaba.com/rss/all", country: "JO", lang: "en" },
    { name: "MEED – Analysis", url: "https://www.meed.com/classifications/analysis/feed", country: "AE", lang: "en" },
    { name: "MEED – Commentary", url: "https://www.meed.com/category/news/commentary/feed/", country: "AE", lang: "en" },
    { name: "MEED – Special Reports", url: "https://www.meed.com/classifications/analysis/special-report/rss", country: "AE", lang: "en" },
    { name: "MEED – Tenders", url: "https://www.meed.com/tenders/feed/", country: "AE", lang: "en" },
    { name: "MEED – Events", url: "https://www.meed.com/events/rss", country: "AE", lang: "en" },
    // MEED Sectors
    { name: "MEED – Construction", url: "https://www.meed.com/sector/construction/rss", country: "AE", lang: "en" },
    { name: "MEED – Finance", url: "https://www.meed.com/sector/banking-finance/rss", country: "AE", lang: "en" },
    { name: "MEED – Industry", url: "https://www.meed.com/sector/industrial/rss", country: "AE", lang: "en" },
    { name: "MEED – Oil & Gas", url: "https://www.meed.com/sector/oil-and-gas/rss", country: "AE", lang: "en" },
    { name: "MEED – Petrochemicals", url: "https://www.meed.com/sector/petrochemicals/rss", country: "AE", lang: "en" },
    { name: "MEED – Power & Water", url: "https://www.meed.com/sector/power-and-water/power/rss", country: "AE", lang: "en" },
    { name: "MEED – Tourism", url: "https://www.meed.com/sector/economy/tourism/rss", country: "AE", lang: "en" },
    { name: "MEED – Transport", url: "https://www.meed.com/sector/transport/rss", country: "AE", lang: "en" },
    { name: "MEED – Water", url: "https://www.meed.com/sector/water/rss", country: "AE", lang: "en" },
    { name: "MEED – Technology & IT", url: "https://www.meed.com/sector/Technology/rss", country: "AE", lang: "en" },
    // MEED Countries
    { name: "MEED – Algeria", url: "https://www.meed.com/countries/algeria/rss/feed", country: "DZ", lang: "en" },
    { name: "MEED – Bahrain", url: "https://www.meed.com/countries/gcc/bahrain/rss/feed", country: "BH", lang: "en" },
    { name: "MEED – Egypt", url: "https://www.meed.com/countries/north-africa/egypt/rss/feed", country: "EG", lang: "en" },
    { name: "MEED – Iran", url: "https://www.meed.com/countries/iran/rss/feed", country: "IR", lang: "en" },
    { name: "MEED – Iraq", url: "https://www.meed.com/countries/iraq/rss/feed", country: "IQ", lang: "en" },
    { name: "MEED – Jordan", url: "https://www.meed.com/countries/levant/jordan/rss/feed", country: "JO", lang: "en" },
    { name: "MEED – Kuwait", url: "https://www.meed.com/countries/gcc/kuwait/rss/feed", country: "KW", lang: "en" },
    { name: "MEED – Lebanon", url: "https://www.meed.com/countries/levant/lebanon/rss/feed", country: "LB", lang: "en" },
    { name: "MEED – Libya", url: "https://www.meed.com/countries/north-africa/libya/rss/feed", country: "LY", lang: "en" },
    { name: "MEED – Morocco", url: "https://www.meed.com/countries/north-africa/morocco/rss/feed", country: "MA", lang: "en" },
    { name: "MEED – Oman", url: "https://www.meed.com/countries/gcc/oman/rss/feed", country: "OM", lang: "en" },
    { name: "MEED – Qatar", url: "https://www.meed.com/countries/gcc/qatar/rss/feed", country: "QA", lang: "en" },
    { name: "MEED – Saudi Arabia", url: "https://www.meed.com/countries/gcc/saudi-arabia/rss/feed", country: "SA", lang: "en" },
    { name: "MEED – Syria", url: "https://www.meed.com/countries/levant/syria/rss/feed", country: "SY", lang: "en" },
    { name: "MEED – Tunisia", url: "https://www.meed.com/countries/north-africa/tunisia/rss/feed", country: "TN", lang: "en" },
    { name: "MEED – UAE", url: "https://www.meed.com/countries/gcc/uae/rss/feed", country: "AE", lang: "en" },
    { name: "Mehr News", url: "https://en.mehrnews.com/rss", country: "IR", lang: "en" },
    { name: "Egyptian Streets", url: "https://egyptianstreets.com/feed/", country: "EG", lang: "en" },
    // ── UAE Regional ──────────────────────────────────────────────────────────
    { name: "Emirates247 – Flash News", url: "https://www.emirates247.com/rss/mobile/v2/flash-news.rss", country: "AE", lang: "en" },
    { name: "Emirates247 – UAE News", url: "https://www.emirates247.com/rss/mobile/v2/uae.rss", country: "AE", lang: "en" },
    { name: "Emirates247 – World News", url: "https://www.emirates247.com/rss/mobile/v2/world.rss", country: "AE", lang: "en" },
    { name: "Emirates247 – Business", url: "https://www.emirates247.com/rss/mobile/v2/business.rss", country: "AE", lang: "en" },
    // ── Global PR / Journalism ────────────────────────────────────────────────
    { name: "Provoke Media", url: "https://www.provokemedia.com/newsfeed/provoke-media-latest", country: "GB", lang: "en" },
    { name: "The New Yorker – The Lede", url: "https://www.newyorker.com/feed/the-lede/rss", country: "US", lang: "en" },
    { name: "Wired – Business", url: "https://www.wired.com/feed/category/business/latest/rss", country: "US", lang: "en" },
    { name: "Wired – AI", url: "https://www.wired.com/feed/tag/ai/latest/rss", country: "US", lang: "en" },
    // ── UAE Specialist ────────────────────────────────────────────────────────
    { name: "Road Safety UAE – Posts", url: "https://www.roadsafetyuae.com/feed/?post_type=post", country: "AE", lang: "en" },
    { name: "Road Safety UAE – Stories", url: "https://www.roadsafetyuae.com/feed/?post_type=stories", country: "AE", lang: "en" },
    { name: "Road Safety UAE – Proposals", url: "https://www.roadsafetyuae.com/feed/?post_type=proposals", country: "AE", lang: "en" },
    // ── Gulf Today ────────────────────────────────────────────────────────────
    { name: "Gulf Today – Latest News", url: "https://www.gulftoday.ae/rss", country: "AE", lang: "en" },
    { name: "Gulf Today – Opinion", url: "https://www.gulftoday.ae/rssFeed/10/", country: "AE", lang: "en" },
    { name: "Gulf Today – News", url: "https://www.gulftoday.ae/rssFeed/55/", country: "AE", lang: "en" },
    { name: "Gulf Today – Culture", url: "https://www.gulftoday.ae/rssFeed/56/", country: "AE", lang: "en" },
    { name: "Gulf Today – Lifestyle", url: "https://www.gulftoday.ae/rssFeed/57/", country: "AE", lang: "en" },
    { name: "Gulf Today – Sport", url: "https://www.gulftoday.ae/rssFeed/58/", country: "AE", lang: "en" },
    { name: "Gulf Today – Business", url: "https://www.gulftoday.ae/rssFeed/52/", country: "AE", lang: "en" },
    // ── Broad Regional News ───────────────────────────────────────────────────
    { name: "Al Arabiya", url: "https://www.alarabiya.net/.mrss/ar/last-24-hours.xml", country: "SA", lang: "ar" },
    { name: "Sky News Arabia", url: "https://www.skynewsarabia.com/feeds/rss/1.xml", country: "AE", lang: "ar" },
    { name: "Asharq Al-Awsat", url: "https://aawsat.com/feed", country: "SA", lang: "ar" },
    { name: "BBC Arabic", url: "https://feeds.bbci.co.uk/arabic/rss.xml", country: "GB", lang: "ar" },
    { name: "Al Jazeera", url: "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84dbbe43033/2013-8-4", country: "QA", lang: "ar" },
    // ── UAE Digital & Magazines ───────────────────────────────────────────────
    { name: "Hashtag Dubai", url: "https://hashtagdubai.org/index.php/feed/", country: "AE", lang: "en" },
    { name: "My Dubai News", url: "https://www.mydubainews.com/feed/", country: "AE", lang: "en" },
    { name: "Dubai PR Network", url: "https://www.dubaiprnetwork.com/rss_feed.asp", country: "AE", lang: "en" },
    { name: "Go Dubai", url: "https://www.godubai.com/citylife/RSSFeedGenerator.asp", country: "AE", lang: "en" },
    { name: "Al Badia Magazine", url: "https://albadiamagazine.com/feed/", country: "AE", lang: "ar" },
    { name: "Al Madar Magazine", url: "https://www.almadarmagazine.ae/feed/", country: "AE", lang: "ar" },
    { name: "First Avenue Magazine", url: "https://firstavenuemagazine.com/feed/", country: "AE", lang: "en" },
    { name: "Evision Worlds", url: "https://evisionworlds.com/?feed=rss2", country: "AE", lang: "en" },
    { name: "Pan Time Arabia", url: "https://pantimearabia.com/rss/", country: "AE", lang: "ar" },
    { name: "UAE Interact", url: "https://www.uaeinteract.com/rss/news", country: "AE", lang: "en" },
    { name: "Food Safety News", url: "https://www.foodsafetynews.com/rss/", country: "US", lang: "en" },
    { name: "Energy Intel", url: "https://www.energyintel.com/rss-feed.rss", country: "US", lang: "en" },
    { name: "Business Day", url: "https://www.businessday.co.za/arc/outboundfeeds/rss/", country: "ZA", lang: "en" },
    { name: "India News Network", url: "https://www.indianewsnetwork.com/rss.xml", country: "IN", lang: "en" },
    { name: "Al Wahda News", url: "https://alwahdanews.ae/feed/", country: "AE", lang: "ar" },
    { name: "Nabd El Emirate", url: "https://nbdelemirate.com/feed/", country: "AE", lang: "ar" },
];

export const fetchPressReleaseSources = action({
    args: {
        keyword: v.optional(v.string()),
        limit: v.optional(v.number()),
        dateFrom: v.optional(v.string()),
        dateTo: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ success: boolean; totalSaved: number; totalErrors: number; feedResults: any[]; message: string }> => {
        try {
            await requireAdmin(ctx.auth);

            const fetchedKeyword = args.keyword?.trim() || "";
            const booleanExpr = parseBooleanKeyword(fetchedKeyword);
            const keyword = fetchedKeyword || "Press Release";
            const itemLimit = args.limit ?? 30;

            const dateFromObj = args.dateFrom ? new Date(args.dateFrom) : null;
            const dateToObj = args.dateTo ? new Date(args.dateTo + "T23:59:59Z") : null;
            const parser = new Parser({
                timeout: 10000,
                customFields: {
                    item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
                }
            });

            let totalSaved = 0;
            let totalErrors = 0;
            const feedResults: any[] = [];

            // 1. Parallel RSS Ingestion
            await Promise.all(
                PR_WIRE_FEEDS.map(async (feed) => {
                    let savedCount = 0;
                    try {
                        const xml = await fetchRobustRss(feed.url);
                        const feedData = await parser.parseString(xml);
                        const candidates = feedData.items.slice(0, itemLimit);

                        const items = candidates.filter((item) => {
                            const title = item.title ?? "";
                            const snippet = item.contentSnippet || item.content || "";

                            // Keyword Filter
                            if (fetchedKeyword && !matchesBooleanFilter(booleanExpr, title, snippet)) return false;

                            // Date Filter
                            if (dateFromObj || dateToObj) {
                                if (!item.pubDate) return true;
                                const pub = new Date(item.pubDate);
                                if (isNaN(pub.getTime())) return true;
                                if (dateFromObj && pub < dateFromObj) return false;
                                if (dateToObj && pub > dateToObj) return false;
                            }
                            return true;
                        });

                        for (const item of items) {
                            if (!item.link || !item.title) continue;
                            const isSeen = await checkAndSetSeen(item.link, item.title);
                            if (isSeen) continue;

                            const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
                            const processed = await processArticle(
                                ctx,
                                {
                                    ...item,
                                    link: item.link,
                                    pubDate: item.pubDate,
                                },
                                feed.country,
                                feed.lang,
                                keyword,
                                geminiKey,
                                ["Press Release"],
                                dateFromObj,
                                dateToObj,
                                false,
                                "Press Release"
                            );
                            if (processed) {
                                savedCount++;
                                totalSaved++;
                            }
                        }
                        feedResults.push({ name: feed.name, status: "Success", saved: savedCount, total: items.length });
                    } catch (err: any) {
                        const message = err.message || String(err);
                        console.error(`❌ Feed Failed: ${feed.name}`, message);
                        let errorLabel = "Failed";
                        if (message.includes("HTTP_403")) errorLabel = "Access Denied (403)";
                        else if (message.includes("HTTP_400")) errorLabel = "Bad Request (400)";
                        else if (message.includes("timeout")) errorLabel = "Timeout";

                        feedResults.push({ name: feed.name, status: "Failed", error: errorLabel, saved: 0 });
                        totalErrors++;
                    }
                })
            );

            // 2. Historical Search
            if (fetchedKeyword && args.dateFrom && args.dateTo) {
                try {
                    const historical = await fetchHistoricalArticles(ctx, fetchedKeyword, args.dateFrom, args.dateTo, itemLimit);
                    let histSaved = 0;
                    for (const article of historical) {
                        const isSeen = await checkAndSetSeen(article.link, article.title);
                        if (isSeen) continue;

                        const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
                        const processed = await processArticle(
                            ctx,
                            article,
                            "Global",
                            "en",
                            keyword,
                            geminiKey,
                            ["Press Release"],
                            dateFromObj,
                            dateToObj,
                            false,
                            "Press Release"
                        );
                        if (processed) {
                            histSaved++;
                            totalSaved++;
                        }
                    }
                    if (historical.length > 0) {
                        feedResults.push({ name: "NewsAPI Historical", status: "Success", saved: histSaved, total: historical.length });
                    }
                } catch (e) {
                    console.warn("[Historical Search] Failed:", e);
                }
            }

            return {
                success: true,
                totalSaved,
                totalErrors,
                feedResults,
                message: `Sync complete. ${totalSaved} articles ingested.`
            };
        } catch (globalError: any) {
            if (globalError.message === "MODEL_CAPACITY_EXHAUSTED") {
                return {
                    success: false,
                    totalSaved: 0,
                    totalErrors: 1,
                    feedResults: [],
                    message: "AI_CAPACITY_EXHAUSTED",
                    capacityExhausted: true,
                    retryAfter: globalError.retryAfter || 60
                } as any;
            }
            throw globalError;
        }
    },
});

