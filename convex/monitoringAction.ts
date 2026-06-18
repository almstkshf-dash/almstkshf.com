/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
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
import { decodeHtmlBuffer, hasMojibake, tryRecoverMojibake } from "./utils/encoding";

// â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
// THE SPIDER â€” Inlined link resolver for Convex Node Runtime
const SHORTENER_DOMAINS = new Set([
    'bit.ly', 'bitly.com', 't.co', 'tinyurl.com', 'rebrand.ly', 'is.gd',
    'buff.ly', 'ow.ly', 'db.tt', 'git.io', 't.me', 'lnkd.in', 'fb.me',
    'amzn.to', 'goo.gl', 'su.pr', 'wp.me', 'short.io', 'rb.gy', 'shorturl.at',
    'tiny.cc', 'qr.ae', 'adf.ly', 'b.link', 'sniply.io', 'clicky.me',
    'news.google.com'
]);

const TRACKING_PARAMS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
    'gclsrc',
    'dclid',
    'yclid',
    'msclkid',
    'mc_eid',
    'mc_cid',
    '_hsenc',
    '_hsmi',
    'mkt_tok',
    'twclid'
];

function cleanUrl(urlStr: string): string {
    try {
        const url = new URL(urlStr);
        for (const param of TRACKING_PARAMS) {
            url.searchParams.delete(param);
        }
        if (url.hash && (url.hash.startsWith('#utm_') || url.hash === '#')) {
            url.hash = '';
        }
        return url.toString();
    } catch {
        return urlStr;
    }
}

function isShortenerUrl(urlStr: string): boolean {
    try {
        const url = new URL(urlStr);
        let hostname = url.hostname.toLowerCase();
        if (hostname.startsWith('www.')) {
            hostname = hostname.substring(4);
        }
        return SHORTENER_DOMAINS.has(hostname);
    } catch {
        return false;
    }
}


// --- SSRF protection helpers (private-IP blocking + DNS validation) ---

/** IPv4 private / reserved ranges - RFC 1918, loopback, APIPA, CGNAT */
const PRIVATE_IPV4_RANGES: RegExp[] = [
    /^0\./,
    /^10\./,
    /^127\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^192\.168\./,
    /^100\.(6[4-9]|[7-9]\d|1([01]\d|2[0-7]))\./,  // CGNAT 100.64/10
    /^198\.5[12]\./,                                   // 198.51.100/24 & 198.18/15
    /^203\.0\.113\./,                                 // TEST-NET-3
];

/** IPv6 non-routable prefixes */
const PRIVATE_IPV6_PREFIXES: RegExp[] = [
    /^::$/,
    /^::1$/i,
    /^fc[0-9a-f]{2}:/i,    // ULA fc00::/7
    /^fd[0-9a-f]{2}:/i,    // ULA fd00::/8
    /^fe[89ab][0-9a-f]:/i, // link-local fe80::/10
    /^64:ff9b:/i,           // NAT64 well-known prefix
];

function isPrivateIp(ip: string): boolean {
    if (ip.includes(':')) {
        return PRIVATE_IPV6_PREFIXES.some((re) => re.test(ip));
    }
    return PRIVATE_IPV4_RANGES.some((re) => re.test(ip));
}

async function isUnsafeHostname(hostname: string): Promise<boolean> {
    const { isIP } = await import('net');
    const dns = await import('dns/promises');
    const lowered = hostname.toLowerCase();
    if (
        lowered === 'localhost' ||
        lowered.endsWith('.local') ||
        lowered.endsWith('.internal') ||
        lowered.endsWith('.localdomain')
    ) {
        return true;
    }
    if (isIP(hostname)) {
        return isPrivateIp(hostname);
    }
    try {
        const results = await (dns as any).lookup(hostname, { all: true });
        return results.some((entry: { address: string }) => isPrivateIp(entry.address));
    } catch {
        return true; // fail-closed: unresolvable => unsafe
    }
}

function getScraperUrl(): string {
    const base = process.env.SCRAPER_SERVICE_URL || 'http://127.0.0.1:3002';
    return base.endsWith('/scrape') ? base : `${base.replace(/\/+$/, '')}/scrape`;
}

/**
 * SSRF-hardened URL resolver for the Convex Node runtime.
 *
 * Security guarantees:
 *  - Strict protocol whitelist: only http: and https: are permitted.
 *  - Every redirect hop is intercepted (redirect:'manual') and the
 *    destination hostname is DNS-resolved before following, blocking
 *    SSRF via open redirects into private/internal networks.
 *  - All resolved IP addresses are tested against private IPv4 and
 *    IPv6 ranges (loopback, RFC-1918, link-local, ULA, CGNAT, etc.).
 *  - Meta-refresh recursion is capped at 3 levels.
 *  - HTTP redirect chain is limited to 5 hops.
 *  - The Playwright scraper fallback also validates the URL before dispatch.
 */
async function resolveUrl(
    originalUrl: string,
    depth = 0
): Promise<{ finalUrl: string, imageUrl?: string, source: string } | null> {
    if (depth > 3) {
        console.warn(`[resolveUrl] Exceeded maximum meta-refresh recursion depth for: ${originalUrl}`);
        return null;
    }

    try {
        // ── Gate 1: validate the entry-point URL ──────────────────────────
        let currentUrl: string;
        try {
            currentUrl = new URL(originalUrl).toString();
        } catch {
            console.warn(`[resolveUrl] Malformed URL rejected: ${originalUrl}`);
            return null;
        }

        const entryParsed = new URL(currentUrl);
        if (!['http:', 'https:'].includes(entryParsed.protocol)) {
            console.warn(`[resolveUrl] Blocked unsafe protocol on entry: ${entryParsed.protocol}`);
            return null;
        }
        if (await isUnsafeHostname(entryParsed.hostname)) {
            console.warn(`[resolveUrl] Blocked unsafe hostname on entry: ${entryParsed.hostname}`);
            return null;
        }

        // ── Redirect-following loop (manual, re-validated at each hop) ────
        let redirectCount = 0;
        const maxRedirects = 5;
        let response: Response | null = null;
        let htmlContent = '';
        let contentTypeHeader = '';
        let standardFetchFailed = false;

        while (redirectCount <= maxRedirects) {
            const hopParsed = new URL(currentUrl);

            // Protocol check at every hop
            if (!['http:', 'https:'].includes(hopParsed.protocol)) {
                console.warn(`[resolveUrl] Blocked unsafe protocol in redirect chain: ${hopParsed.protocol}`);
                return null;
            }
            // SSRF check at every hop — resolves DNS and tests IP ranges
            if (await isUnsafeHostname(hopParsed.hostname)) {
                console.warn(`[resolveUrl] Blocked unsafe hostname in redirect chain: ${hopParsed.hostname}`);
                return null;
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            try {
                const res = await fetch(currentUrl, {
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
                    redirect: 'manual',   // ← intercept every redirect for SSRF validation
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (res.status >= 300 && res.status < 400) {
                    const location = res.headers.get('location');
                    if (!location) { response = res; break; }
                    // Resolve relative redirect location against current URL
                    currentUrl = new URL(location, currentUrl).toString();
                    redirectCount++;
                    continue;
                }

                if (!res.ok) {
                    console.warn(`[resolveUrl] Standard fetch returned HTTP ${res.status} for ${currentUrl}`);
                    standardFetchFailed = true;
                    break;
                }

                response = res;
                const buffer = await res.arrayBuffer();
                contentTypeHeader = res.headers.get('content-type') || '';
                htmlContent = decodeHtmlBuffer(buffer, contentTypeHeader);
                break;
            } catch (fetchErr) {
                clearTimeout(timeout);
                console.warn(`[resolveUrl] Fetch error for ${currentUrl}:`, fetchErr);
                standardFetchFailed = true;
                break;
            }
        }

        if (redirectCount > maxRedirects) {
            console.warn(`[resolveUrl] Exceeded maximum redirect limit of ${maxRedirects} hops.`);
            standardFetchFailed = true;
        }

        // ── Process successful fetch ───────────────────────────────────────
        if (!standardFetchFailed && response && htmlContent) {
            const finalUrl = currentUrl;
            const $ = cheerio.load(htmlContent);

            // Handle HTML meta-refresh (recursive, depth-limited)
            const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
            if (metaRefresh) {
                const match = metaRefresh.match(/url=(.+)$/i);
                if (match && match[1]) {
                    let redirectUrl = match[1].trim().replace(/['"]/g, '');
                    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                        redirectUrl = new URL(redirectUrl, finalUrl).toString();
                    }
                    console.log(`[resolveUrl] Found meta-refresh redirect to: ${redirectUrl}. Resolving recursively (depth ${depth + 1})...`);
                    return resolveUrl(redirectUrl, depth + 1);
                }
            }

            if (isShortenerUrl(finalUrl)) {
                console.warn(`[resolveUrl] Resolved URL is still a shortener: ${finalUrl}. Falling back to Playwright scraper...`);
                standardFetchFailed = true;
            } else {
                // Final URL validation after all hops
                const finalParsed = new URL(finalUrl);
                if (!['http:', 'https:'].includes(finalParsed.protocol)) {
                    console.warn(`[resolveUrl] Blocked unsafe final URL protocol: ${finalParsed.protocol}`);
                    return null;
                }
                if (await isUnsafeHostname(finalParsed.hostname)) {
                    console.warn(`[resolveUrl] Blocked unsafe final URL hostname: ${finalParsed.hostname}`);
                    return null;
                }

                const imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content');
                const siteName = $('meta[property="og:site_name"]').attr('content') || finalParsed.hostname;
                return { finalUrl: cleanUrl(finalUrl), imageUrl, source: siteName };
            }
        }

        // ── Playwright scraper fallback (also SSRF-validated) ─────────────
        try {
            const scraperParsed = new URL(originalUrl);
            if (!['http:', 'https:'].includes(scraperParsed.protocol)) {
                console.warn(`[resolveUrl] Blocked unsafe protocol before scraper invocation: ${scraperParsed.protocol}`);
                return null;
            }
            if (await isUnsafeHostname(scraperParsed.hostname)) {
                console.warn(`[resolveUrl] Blocked unsafe hostname before scraper invocation: ${scraperParsed.hostname}`);
                return null;
            }

            console.log(`[resolveUrl] Invoking Playwright Scraper Service for: ${originalUrl}`);
            const scraperRes = await fetch(getScraperUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: originalUrl, timeout: 12000, waitAfterLoad: 0 })
            });
            if (scraperRes.ok) {
                const scraperData = await scraperRes.json();
                if (scraperData.success) {
                    const resolvedUrl = scraperData.url || originalUrl;
                    const resolvedParsed = new URL(resolvedUrl);
                    if (!['http:', 'https:'].includes(resolvedParsed.protocol)) {
                        console.warn(`[resolveUrl] Scraper resolved to unsafe protocol: ${resolvedParsed.protocol}`);
                        return null;
                    }
                    if (await isUnsafeHostname(resolvedParsed.hostname)) {
                        console.warn(`[resolveUrl] Scraper resolved to unsafe hostname: ${resolvedParsed.hostname}`);
                        return null;
                    }
                    console.log(`[resolveUrl] Playwright Scraper successfully resolved: ${originalUrl}`);
                    return {
                        finalUrl: cleanUrl(resolvedUrl),
                        imageUrl: scraperData.imageUrl || undefined,
                        source: scraperData.sourceName || resolvedParsed.hostname
                    };
                }
            } else {
                console.error(`[resolveUrl] Playwright Scraper service returned status: ${scraperRes.status}`);
            }
        } catch (scraperErr: any) {
            console.error(`[resolveUrl] Playwright Scraper fallback failed for ${originalUrl}:`, scraperErr.message);
        }
        return null;
    } catch (error: any) {
        console.warn(`[resolveUrl] Failed to resolve: ${originalUrl}`, error);
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
                                responseSchema: {
                                    type: "OBJECT",
                                    properties: {
                                        sentiment: { type: "STRING", enum: ["Positive", "Neutral", "Negative"] },
                                        summary: { type: "STRING" },
                                        sourceType: { type: "STRING", enum: ["Online News", "Blog", "Press Release", "Social Media", "Print"] },
                                        reach_estimate: { type: "INTEGER" },
                                        tone: { type: "STRING" },
                                        risk: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
                                        hashtags: { type: "ARRAY", items: { type: "STRING" } },
                                        emotions: {
                                            type: "OBJECT",
                                            properties: {
                                                joy: { type: "INTEGER" },
                                                sadness: { type: "INTEGER" },
                                                anger: { type: "INTEGER" },
                                                fear: { type: "INTEGER" },
                                                surprise: { type: "INTEGER" },
                                                trust: { type: "INTEGER" }
                                            },
                                            required: ["joy", "sadness", "anger", "fear", "surprise", "trust"]
                                        }
                                    },
                                    required: ["sentiment", "summary", "sourceType", "reach_estimate", "tone", "risk", "hashtags", "emotions"]
                                }
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

    console.error("❌ All Gemini models failed or key is missing. Using heuristic values.");

    // ── HEURISTIC FALLBACK LOGIC ──────────────────────────────────────
    const lowerText = (title + " " + snippet).toLowerCase();
    let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
    let risk: "Low" | "Medium" | "High" = "Medium";

    // EN/AR Positive keywords
    if (lowerText.match(/(growth|success|positive|profit|award|win|won|increase|expansion|partnership|launch|breakthrough|milestone|leader|innovative|نجاح|ارباح|فوز|ازدهار|نمو|تطور|شراكة|اطلاق|ابتكار)/i)) {
        sentiment = "Positive";
        risk = "Low";
    }
    // EN/AR Negative keywords (Colloquial + Formal + Harmful)
    else if (lowerText.match(/(نصب|خراب|زفت|فضيحة|ورطة|تعيس|فاشل|حشيش|ماريجوانا|كريستال|كوك|ترامادول|لاريكا|سي بي دي|loss|decline|negative|drop|decrease|fail|scandal|breach|lawsuit|violation|fraud|crisis|warning|risk|hashish|weed|cocauine|teramadol|larica|massage in dubai|happy ending|cristal mith|escort girls|harm|harmfull|CBD OIL|خسارة|تراجع|فشل|فضيحة|اختراق|دعوى|انتهاك|احتيال|ازمة|تحذير|خطر)/i)) {
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
const RELEVANCY_THRESHOLD = 75;

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
                                responseSchema: {
                                    type: "OBJECT",
                                    properties: {
                                        relevancy_score: { type: "INTEGER" },
                                        reason: { type: "STRING" }
                                    },
                                    required: ["relevancy_score", "reason"]
                                }
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

            const parser = new Parser({
                timeout: 10000,
                customFields: {
                    item: [['source', 'source']]
                }
            });

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
                // Expanded premium site whitelist for robust Press Release discovery
                enrichedQuery += ' (site:prnewswire.com OR site:businesswire.com OR site:zawya.com OR site:wam.ae OR site:globenewswire.com OR site:einpresswire.com OR site:accesswire.com OR site:me-newswire.net OR site:spa.gov.sa OR site:newsfilecorp.com OR site:prweb.com OR site:marketwired.com OR site:prunderground.com OR site:eyeofriyadh.com OR site:eyeofdubai.ae OR site:saudigazette.com.sa OR site:arabnews.com OR site:gulfnews.com OR site:gulftoday.ae OR site:khaleejtimes.com OR site:thenationalnews.com OR site:thenational.ae OR site:aetoswire.com OR site:albawaba.com OR site:alarabiya.net OR site:skynewsarabia.com OR site:middleeasteye.net OR site:meed.com)';
            } else if (stList.includes('Social Media')) {
                enrichedQuery += ' (site:twitter.com OR site:x.com OR site:reddit.com OR site:linkedin.com OR site:facebook.com OR site:instagram.com)';
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
                    console.error(`❌ GLEIF fail`, e);
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
            let result = null;
            if (worldnewsKey) {
                result = await extractWithWorldNews(args.url, worldnewsKey, args.analyze || false);
            }

            if (!result) {
                console.log("ℹ️ WorldNews extractor unavailable or failed. Trying direct scraper...");
                result = await extractWithDirectScraper(args.url, args.analyze || false);
            }


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

async function extractWithDirectScraper(url: string, analyze: boolean = false) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
            },
            signal: controller.signal
        });

        clearTimeout(timeout);
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();
        const html = decodeHtmlBuffer(buffer, response.headers.get('content-type'));
        const $ = cheerio.load(html);

        // Extract title
        let title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() ||
            $('h1').first().text();

        title = title ? title.trim() : '';

        // Extract description/text
        let text = $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('meta[name="description"]').attr('content');

        // Grab paragraph tags if text is short
        const paragraphs: string[] = [];
        $('article p, .entry-content p, .post-content p, p').each((_, el) => {
            const pText = $(el).text().trim();
            if (pText.length > 20) {
                paragraphs.push(pText);
            }
        });

        if (paragraphs.length > 0) {
            text = paragraphs.join('\n\n');
        } else {
            text = text ? text.trim() : '';
        }

        // Extract image
        const image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('link[rel="image_src"]').attr('href') ||
            $('img').first().attr('src');

        // Extract publish date
        let publish_date = $('meta[property="article:published_time"]').attr('content') ||
            $('meta[property="og:article:published_time"]').attr('content') ||
            $('meta[name="publication_date"]').attr('content') ||
            $('meta[name="publish_date"]').attr('content') ||
            $('time').attr('datetime');

        if (!publish_date) {
            publish_date = new Date().toISOString();
        }

        // Lightweight sentiment analysis if requested
        let sentiment = 0.0;
        if (analyze) {
            const textToAnalyze = ((title || '') + ' ' + (text || '')).toLowerCase();

            // Simple keyword dictionary
            const positiveWords = [
                'نجاح', 'تميز', 'رائع', 'شراكة', 'إنجاز', 'سعادة', 'مبادرة', 'خير', 'تقدم', 'تطوير', 'نمو', 'أمل', 'شكر', 'تقدير',
                'success', 'excel', 'great', 'partner', 'achieve', 'happy', 'initiative', 'good', 'progress', 'develop', 'growth', 'hope', 'thanks'
            ];
            const negativeWords = [
                'فشل', 'خسارة', 'تراجع', 'عجز', 'أزمة', 'مشكلة', 'خطر', 'سيء', 'وفاة', 'حادث', 'حزن', 'غضب', 'سرقة', 'جريمة',
                'fail', 'loss', 'decline', 'deficit', 'crisis', 'problem', 'danger', 'bad', 'death', 'accident', 'sad', 'angry', 'theft', 'crime'
            ];

            let posCount = 0;
            let negCount = 0;

            positiveWords.forEach(word => {
                const regex = new RegExp(word, 'g');
                const matches = textToAnalyze.match(regex);
                if (matches) posCount += matches.length;
            });

            negativeWords.forEach(word => {
                const regex = new RegExp(word, 'g');
                const matches = textToAnalyze.match(regex);
                if (matches) negCount += matches.length;
            });

            const total = posCount + negCount;
            if (total > 0) {
                sentiment = (posCount - negCount) / total;
            }
        }

        return {
            title,
            text,
            image: image || '',
            publish_date,
            sentiment
        };
    } catch (e) {
        console.error("â Œ Direct Scraper Extract fail", e);
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

/**
 * Helper to get reach for an article based on domain traffic from SimilarWeb, with fallbacks.
 */
async function getArticleReach(
    ctx: any,
    urlStr: string,
    sourceType: string,
    aiReachEstimate: number
): Promise<{ reach: number; source: string }> {
    const validReachTypes = ["Online News", "Blog", "Press Release"];
    if (!validReachTypes.includes(sourceType)) {
        return { reach: aiReachEstimate || 15000, source: "ai" };
    }

    try {
        const url = new URL(urlStr);
        let domain = url.hostname.toLowerCase();
        if (domain.startsWith("www.")) {
            domain = domain.substring(4);
        }

        if (!domain) {
            return { reach: aiReachEstimate || 50000, source: "fallback" };
        }

        // 1. Check if SimilarWeb API Key is configured
        const similarwebKey = await resolveApiKey(ctx, "SIMILARWEB_API_KEY", "similarweb");
        if (!similarwebKey || similarwebKey === "None") {
            return { reach: aiReachEstimate || 50000, source: "ai_no_key" };
        }

        // 2. Check if we have cached traffic volume for this domain
        const cached = await ctx.runQuery(api.monitoring.getCachedDomainTraffic, { domain });
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        let monthlyVisits: number | null = null;

        if (cached && (Date.now() - cached.lastFetchedAt) < THIRTY_DAYS) {
            console.log(`[SimilarWeb Cache] Found cached traffic for ${domain}: ${cached.monthlyVisits} visits`);
            monthlyVisits = cached.monthlyVisits;
        } else {
            // 3. Fetch from SimilarWeb API
            console.log(`[SimilarWeb API] Fetching traffic for ${domain}...`);
            const apiUrl = `https://api.similarweb.com/v1/website/${encodeURIComponent(domain)}/total-traffic-and-engagement/visits?api_key=${encodeURIComponent(similarwebKey)}&country=world&granularity=monthly`;

            const response = await fetch(apiUrl, {
                headers: { "Accept": "application/json" }
            });

            if (response.ok) {
                const data = await response.json() as any;
                if (data && Array.isArray(data.visits) && data.visits.length > 0) {
                    const sortedVisits = [...data.visits].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const latestPeriod = sortedVisits[sortedVisits.length - 1];
                    if (latestPeriod && typeof latestPeriod.visits === "number") {
                        monthlyVisits = latestPeriod.visits;
                        console.log(`[SimilarWeb API] Traffic for ${domain}: ${monthlyVisits} visits`);

                        // Save to cache
                        await ctx.runMutation(api.monitoring.saveCachedDomainTraffic, {
                            domain,
                            monthlyVisits
                        });
                    }
                }
            } else {
                console.warn(`[SimilarWeb API] Error or no data for ${domain}: ${response.statusText} (${response.status})`);
            }
        }

        if (monthlyVisits !== null && monthlyVisits > 0) {
            // Estimate article reach as 1% of the domain's monthly visits, bounded between 1,000 and 10,000,000.
            let reachVal = Math.round(monthlyVisits / 100);
            if (reachVal < 1000) reachVal = 1000;
            if (reachVal > 10000000) reachVal = 10000000;

            console.log(`[SimilarWeb Reach] Domain monthly visits: ${monthlyVisits} => Article Reach (Visits/100): ${reachVal}`);
            return { reach: reachVal, source: "similarweb" };
        }
    } catch (err) {
        console.error(`[SimilarWeb Reach Estimation] Failed for ${urlStr}:`, err);
    }

    return { reach: aiReachEstimate || 50000, source: "ai_fallback" };
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

    // Clean Mojibake early
    item.title = hasMojibake(item.title) ? (tryRecoverMojibake(item.title) || item.title) : item.title;
    if (item.contentSnippet) {
        item.contentSnippet = hasMojibake(item.contentSnippet) ? (tryRecoverMojibake(item.contentSnippet) || item.contentSnippet) : item.contentSnippet;
    }
    if (item.content) {
        item.content = hasMojibake(item.content) ? (tryRecoverMojibake(item.content) || item.content) : item.content;
    }

    try {
        // ── GATE 1: Boolean Pre-Filter ──────────────────────────────────────
        const isGeneralPressRelease = keyword === "Press Release" || /^https?:\/\//i.test(keyword);
        const boolExpr = parseBooleanKeyword(keyword);
        const snippet = item.contentSnippet || item.content || item.title;
        if (!isGeneralPressRelease && !matchesBooleanFilter(boolExpr, item.title, snippet)) {
            console.log(`⚡ Boolean reject: "${item.title.substring(0, 60)}..."`);
            return false;
        }

        // ── GATE 2: Date Filter ──────────────────────────────────────────────────
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (pubDate) {
            if (dateFrom && pubDate < dateFrom) {
                console.log(`📅 [Gate 2] Date reject (Too old): ${item.link}`);
                return false;
            }
            if (dateTo && pubDate > dateTo) {
                console.log(`📅 [Gate 2] Date reject (Too new): ${item.link}`);
                return false;
            }
        }

        // ── GATE 3: Redis Deduplication (24-hour hash cache) ──────────────────
        const isDuplicate = await checkAndSetSeen(item.link, item.title);
        if (isDuplicate) {
            console.log(`♻️ [Gate 3] Deduplication: Skipped duplicate link/title`);
            return false;
        }

        const resolvedUrl = item.link;
        const imageUrl = item.imageUrl;
        const sourceName = item.source || item.creator;

        const parsedSourceType = sanitizeSourceType(forceSourceType);
        const d = pubDate || new Date();
        const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

        const isArabic = /[\u0600-\u06FF]/.test(item.title + snippet);
        const language = isArabic ? "AR" : (lang === "ar" ? "AR" : "EN");

        await ctx.runMutation(api.monitoring.saveArticle, {
            keyword,
            url: item.link,
            resolvedUrl: resolvedUrl,
            publishedDate: formattedDate,
            title: item.title,
            content: snippet || item.title,
            language: language as "EN" | "AR",
            sentiment: "Neutral",
            sourceType: parsedSourceType,
            sourceCountry: country,
            source: sourceName || new URL(item.link).hostname,
            tone: "Neutral",
            risk: "Low",
            reach: 50000,
            ave: 5000,
            imageUrl: imageUrl,
            likes: item.likes,
            retweets: item.retweets,
            replies: item.replies,
            analysisStatus: "pending",
            ingestMethod: shouldResolve ? "rss" : "api",
        });

        return true;
    } catch (error) {
        console.error(`❌ Article processing failed for "${item.link}":`, error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND ARTICLE ANALYSIS — Async Gemini analysis for pending articles
// ═══════════════════════════════════════════════════════════════════════════════
export const analyzeArticleBackground = internalAction({
    args: { articleId: v.id("media_monitoring_articles") },
    handler: async (ctx, { articleId }) => {
        try {
            const article = await ctx.runQuery(api.monitoring.getArticle, { id: articleId });
            if (!article) {
                console.error(`[analyzeArticleBackground] Article ${articleId} not found.`);
                return;
            }

            const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            // 1. Resolve URL in background if ingestMethod is "rss"
            let resolvedUrl = article.resolvedUrl || article.url;
            let imageUrl = article.imageUrl;
            let sourceName = article.source;

            if (article.ingestMethod === "rss") {
                console.log(`🕷️ [Background Resolve] Resolving URL: ${article.url}`);
                const resolved = await resolveUrl(article.url);
                if (resolved) {
                    resolvedUrl = resolved.finalUrl;
                    imageUrl = resolved.imageUrl || imageUrl;
                    
                    const resolvedSourceLower = (resolved.source || "").toLowerCase();
                    if (resolved.source && !resolvedSourceLower.includes("google") && !resolvedSourceLower.includes("news.google.com")) {
                        sourceName = resolved.source;
                    }
                }
            }

            // Clean up sourceName if it is Google-related by extracting from the end of the title
            const sourceLower = (sourceName || "").toLowerCase();
            if (sourceLower.includes("google") || sourceLower === "news.google.com") {
                const cleanTitle = article.title.replace(/\s*[-–|]\s*Google\s*(?:News)?\s*$/i, '').trim();
                const titleParts = cleanTitle.split(/\s+[-|]\s+/);
                if (titleParts.length > 1) {
                    const potentialPub = titleParts[titleParts.length - 1].trim();
                    if (potentialPub && !potentialPub.toLowerCase().includes("google")) {
                        sourceName = potentialPub;
                    }
                }
            }

            // 2. Relevancy Check in background
            const isGeneralPressRelease = article.keyword === "Press Release" || /^https?:\/\//i.test(article.keyword);
            let relevancyScore = article.relevancy_score ?? 100;

            if (!isGeneralPressRelease && article.relevancy_score === undefined) {
                relevancyScore = await callGeminiRelevancyScore(
                    geminiKey,
                    article.title,
                    article.content,
                    article.keyword
                );

                if (relevancyScore < RELEVANCY_THRESHOLD) {
                    console.log(`⚠️ [Background Filter] Low relevancy (${relevancyScore}/100) — deleting article: "${article.title.substring(0, 60)}"`);
                    await ctx.runMutation(api.monitoring.deleteArticle, { id: articleId });
                    return;
                }
            }

            // 3. Run full Gemini analysis
            const aiData = await callGeminiForAnalysis(
                geminiKey,
                article.title,
                article.content,
                article.keyword,
                []
            );

            const parsedSourceType = sanitizeSourceType(aiData.sourceType);

            // 4. SimilarWeb-based Reach lookup
            const reachResult = await getArticleReach(
                ctx,
                resolvedUrl,
                parsedSourceType,
                aiData.reach_estimate
            );

            const reach = reachResult.reach;
            const ave = Math.round(reach * 0.02 * 5);
            const depth = (aiData.risk === "High" || aiData.risk === "Critical" || aiData.risk === "critical") ? "deep" : "standard";

            await ctx.runMutation(api.monitoring.updateArticleAfterAnalysis, {
                id: articleId,
                sentiment: aiData.sentiment,
                analysisStatus: "completed",
                tone: aiData.tone,
                risk: aiData.risk,
                reach,
                ave,
                emotions: aiData.emotions,
                content: aiData.summary || article.content,
                depth: depth as "standard" | "deep",
                resolvedUrl: resolvedUrl,
                imageUrl: imageUrl,
                source: sourceName,
                relevancy_score: relevancyScore,
            });

            // 5. Deep Enrichment
            if (depth === "deep") {
                console.log(`🔍 [Background Deep Promotion] Article for "${article.keyword}" promoted.`);
                ctx.runAction(api.osint.lookupNews, { query: article.keyword }).catch(console.error);
                ctx.runAction(api.darkWeb.searchAhmia, { query: article.keyword }).catch(console.error);
            }

            // 6. Notifications for critical/press release
            const isPressRelease = parsedSourceType === "Press Release";
            const isCritical = aiData.risk === "High" || aiData.risk === "Critical" || aiData.risk === "critical" || aiData.sentiment === "Negative";

            if (isCritical || isPressRelease) {
                try {
                    await ctx.runMutation(api.monitoring.createNotification, {
                        title: isCritical ? "critical_mention" : "press_release_found",
                        message: `${isPressRelease ? "[Press Release] " : ""}Mention for "${article.keyword}": ${article.title.substring(0, 60)}...`,
                        type: isCritical ? "alert" : "system"
                    });

                    if (isCritical) {
                        const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "k.account@almstkshf.com";
                        await sendResendEmail({
                            to: CONTACT_EMAIL,
                            subject: `Urgent Alert: High Risk Mention for "${article.keyword}"`,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                                    <div style="background-color: #ef4444; padding: 15px; border-radius: 8px 8px 0 0; color: white;">
                                        <h2 style="margin: 0;">ALMSTKSHF Critical Alert</h2>
                                    </div>
                                    <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                                        <p style="margin-top: 0;"><strong>Keyword:</strong> ${article.keyword}</p>
                                        <p><strong>Risk Level:</strong> <span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${aiData.risk}</span></p>
                                        <p><strong>Sentiment:</strong> <span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${aiData.sentiment}</span></p>
                                        
                                        <h3 style="margin-top: 20px;">Article Title</h3>
                                        <p style="background: #f8fafc; padding: 10px; border-radius: 4px;">${article.title}</p>
                                        
                                        <h3>AI Summary</h3>
                                        <p style="line-height: 1.5;">${aiData.summary || "No summary provided."}</p>
                                        
                                        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                                            <a href="${resolvedUrl}" style="background-color: #0f172a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Article</a>
                                        </div>
                                    </div>
                                </div>
                            `
                        });
                    }
                } catch (err) {
                    console.error("[analyzeArticleBackground] Notification/Email failed:", err);
                }
            }

            console.log(`✅ [analyzeArticleBackground] Completed for article ${articleId}`);
        } catch (error) {
            console.error(`❌ [analyzeArticleBackground] Failed for article ${articleId}:`, error);
            try {
                await ctx.runMutation(api.monitoring.updateArticleAfterAnalysis, {
                    id: articleId,
                    sentiment: "Neutral",
                    analysisStatus: "failed",
                    reach: 50000,
                    ave: 5000,
                });
            } catch (updateErr) {
                console.error(`❌ [analyzeArticleBackground] Failed to update status for ${articleId}:`, updateErr);
            }
        }
    }
});

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

        const buffer = await response.arrayBuffer();
        let xml = decodeHtmlBuffer(buffer, response.headers.get('content-type'));
        // Sanitization for AETOSWire and others with potential malformed XML
        xml = xml.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/g, "");

        const trimmedXml = xml.trim().toLowerCase();
        const isHtml = trimmedXml.startsWith('<!doctype html') || 
                       trimmedXml.startsWith('<html') ||
                       trimmedXml.startsWith('<doctype html');
        if (isHtml) {
            throw new Error("HTML_RESPONSE");
        }
        return xml;
    } catch (error: any) {
        console.warn(`[fetchRobustRss] Direct fetch failed for ${url}: ${error.message || error}. Trying Playwright Scraper Service...`);
        try {
            // Falls back to the Premium Playwright Scraper microservice with Bright Data/Oxylabs proxy rotation!
            const scraperRes = await fetch(getScraperUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, timeout: 12000, waitAfterLoad: 0 })
            });
            if (scraperRes.ok) {
                const scraperData = await scraperRes.json();
                if (scraperData.success && (scraperData.rawContent || scraperData.rawContentBase64)) {
                    console.log(`[fetchRobustRss] Playwright Scraper successfully fetched RSS XML for: ${url}`);
                    let xml = '';
                    if (scraperData.rawContentBase64) {
                        const buffer = Buffer.from(scraperData.rawContentBase64, 'base64');
                        xml = decodeHtmlBuffer(buffer, scraperData.contentType || scraperData.headers?.['content-type']);
                    } else {
                        xml = scraperData.rawContent || '';
                    }

                    if (hasMojibake(xml)) {
                        const recovered = tryRecoverMojibake(xml);
                        if (recovered) {
                            console.log(`[fetchRobustRss] Recovered mojibake in scraper XML for ${url}`);
                            xml = recovered;
                        }
                    }

                    xml = xml.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/g, "");

                    const trimmedXml = xml.trim().toLowerCase();
                    const isHtml = trimmedXml.startsWith('<!doctype html') || 
                                   trimmedXml.startsWith('<html') ||
                                   trimmedXml.startsWith('<doctype html');
                    if (isHtml) {
                        throw new Error("HTML_RESPONSE");
                    }
                    return xml;
                }
            }
        } catch (scraperErr: any) {
            console.error(`[fetchRobustRss] Playwright Scraper fallback also failed for ${url}:`, scraperErr.message);
            if (scraperErr.message === "HTML_RESPONSE") {
                throw scraperErr;
            }
        }
        throw error;
    }
}

async function fetchTwitterTweets(username: string, bearerToken: string | null): Promise<any[]> {
    console.log(`🐦 [fetchTwitterTweets] Fetching tweets for @${username} (Bearer token available: ${!!bearerToken})`);

    // 1. Try official API v2 if bearer token is available
    if (bearerToken) {
        try {
            // First, lookup user ID by username
            const lookupUrl = `https://api.twitter.com/2/users/by/username/${username}`;
            const lookupRes = await fetch(lookupUrl, {
                headers: { 'Authorization': `Bearer ${bearerToken}` }
            });
            if (lookupRes.ok) {
                const lookupData = await lookupRes.json();
                if (lookupData?.data?.id) {
                    const userId = lookupData.data.id;
                    // Now, fetch latest 20 tweets for this user ID
                    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=20&tweet.fields=created_at,author_id,entities,public_metrics&expansions=author_id`;
                    const tweetsRes = await fetch(tweetsUrl, {
                        headers: { 'Authorization': `Bearer ${bearerToken}` }
                    });
                    if (tweetsRes.ok) {
                        const tweetsData = await tweetsRes.json();
                        if (tweetsData?.data) {
                            console.log(`✅ [fetchTwitterTweets] Fetched ${tweetsData.data.length} tweets via API v2 for @${username}`);
                            return tweetsData.data.map((tweet: any) => ({
                                title: `Tweet by @${username}`,
                                link: `https://twitter.com/${username}/status/${tweet.id}`,
                                pubDate: tweet.created_at,
                                contentSnippet: tweet.text,
                                content: tweet.text,
                                imageUrl: null
                            }));
                        }
                    } else {
                        console.warn(`⚠️ Twitter API tweets endpoint failed for @${username}: ${tweetsRes.status}`);
                    }
                }
            } else {
                console.warn(`⚠️ Twitter API user lookup failed for @${username}: ${lookupRes.status}`);
            }
        } catch (err) {
            console.error(`❌ Twitter API failed for @${username}, falling back to syndication...`, err);
        }
    }

    // 2. Fallback to syndication.twitter.com/srv/timeline-profile/screen-name=...
    try {
        const syndicationUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name=${username}`;
        const res = await fetch(syndicationUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5,ar;q=0.3',
            }
        });
        if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            const nextDataJson = $('#__NEXT_DATA__').html();
            if (nextDataJson) {
                const parsed = JSON.parse(nextDataJson);
                // The tweets are nested in prop entries
                const timelineEntries = parsed?.props?.pageProps?.timeline?.entries || [];
                const tweets: any[] = [];
                for (const entry of timelineEntries) {
                    const tweet = entry?.content?.tweet;
                    if (tweet) {
                        tweets.push({
                            title: `Tweet by @${username}`,
                            link: `https://twitter.com/${username}/status/${tweet.id_str}`,
                            pubDate: tweet.created_at,
                            contentSnippet: tweet.full_text || tweet.text || "",
                            content: tweet.full_text || tweet.text || "",
                            imageUrl: tweet.mediaDetails?.[0]?.media_url_https || null
                        });
                    }
                }
                if (tweets.length > 0) {
                    console.log(`✅ [fetchTwitterTweets] Scraped ${tweets.length} tweets from syndication for @${username}`);
                    return tweets;
                }
            }
        }
        console.warn(`⚠️ Syndication scraping returned no tweets for @${username}`);
    } catch (err) {
        console.error(`❌ Twitter syndication fallback failed for @${username}`, err);
    }

    return [];
}

const PR_WIRE_FEEDS = [
    { name: "Sky News Arabia (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia", country: "AE", lang: "ar" },
    { name: "Al Arabiya (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AlArabiya", country: "SA", lang: "ar" },
    { name: "Al Jazeera Mubasher (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AJMubasher", country: "QA", lang: "ar" },
    { name: "Al Kass TV (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=alkass_tv", country: "QA", lang: "ar" },
    { name: "Dubai PR Network", url: "https://www.dubaiprnetwork.com/rss_feed.asp", country: "AE", lang: "en" },
    // { name: "Gulf Today", url: "https://www.gulftoday.ae/rssFeed/0/", country: "AE", lang: "en" },
    // { name: "The National", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml", country: "AE", lang: "en" },
    { name: "Arab News", url: "https://www.arabnews.com/rss.xml", country: "SA", lang: "en" },
    { name: "Newswire_com", url: "https://www.newswire.com/newsroom/rss/all", country: "US", lang: "en" },
    // { name: "Sky News Arabia", url: "https://www.skynewsarabia.com/rss.xml", country: "AE", lang: "ar" },
    { name: "Asharq Al-Awsat", url: "https://aawsat.com/feed", country: "SA", lang: "ar" },
    { name: "Hashtag Dubai", url: "https://hashtagdubai.org/index.php/feed/", country: "AE", lang: "en" },
    { name: "My Dubai News", url: "https://www.mydubainews.com/feed/", country: "AE", lang: "en" },
    { name: "Al Badia Magazine", url: "https://albadiamagazine.com/feed/", country: "AE", lang: "ar" },
    { name: "Al Madar Magazine", url: "https://www.almadarmagazine.ae/feed/", country: "AE", lang: "ar" },
    { name: "First Avenue Magazine", url: "https://firstavenuemagazine.com/feed/", country: "AE", lang: "en" },
    { name: "Evision Worlds", url: "https://evisionworlds.com/?feed=rss2", country: "AE", lang: "en" },
    { name: "Pan Time Arabia", url: "https://pantimearabia.com/rss/", country: "AE", lang: "en" },
    { name: "Food Safety News", url: "https://www.foodsafetynews.com/rss/", country: "US", lang: "en" },
    { name: "Energy Intel", url: "https://www.energyintel.com/rss-feed.rss", country: "US", lang: "en" },
    { name: "Business Day", url: "https://www.businessday.co.za/arc/outboundfeeds/rss/", country: "ZA", lang: "en" },
    { name: "India News Network", url: "https://www.indianewsnetwork.com/rss.xml", country: "IN", lang: "en" },
    { name: "Al Wahda News", url: "https://alwahdanews.ae/feed/", country: "AE", lang: "ar" },
    { name: "Nabd El Emirate", url: "https://nbdelemirate.com/feed/", country: "AE", lang: "ar" },
    { name: "24.ae", url: "https://24.ae/rss.aspx", country: "AE", lang: "ar" },
    { name: "UAE Barq", url: "https://www.uaebarq.ae/ar/feed/", country: "AE", lang: "ar" },
    { name: "Gulf Time", url: "https://gulftime.online/feed/", country: "AE", lang: "ar" },
    { name: "New Vora Group", url: "https://newvoragroup.com/feed/", country: "AE", lang: "ar" },
    { name: "Ain Al Emirate", url: "https://www.ainalemirate.com/feed/", country: "AE", lang: "ar" },
    { name: "Mena Scoop", url: "https://menascoop.com/feed/", country: "AE", lang: "ar" },
    { name: "Provoke Media", url: "https://www.provokemedia.com/newsfeed/provoke-media-latest", country: "GB", lang: "en" },
    { name: "The New Yorker", url: "https://www.newyorker.com/feed/the-lede/rss", country: "US", lang: "en" },
    { name: "Wired", url: "https://www.wired.com/feed/category/business/latest/rss", country: "US", lang: "en" },
    { name: "Emirates247", url: "https://www.emirates247.com/rss/mobile/v2/uae.rss", country: "AE", lang: "en" },
    // ── International News Sources ──────────────────────────────────────────────
    { name: "NPR", url: "http://www.npr.org/rss/rss.php?id=1004", country: "US", lang: "en" },
    { name: "Fox News", url: "http://feeds.foxnews.com/foxnews/latest", country: "US", lang: "en" },
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", country: "GB", lang: "en" },
    { name: "Yahoo News", url: "http://rss.news.yahoo.com/rss/world", country: "US", lang: "en" },
    { name: "LA Times", url: "http://www.latimes.com/world/rss2.0.xml", country: "US", lang: "en" },
    { name: "CS Monitor", url: "http://rss.csmonitor.com/feeds/usa", country: "US", lang: "en" },
    { name: "NBC News", url: "http://feeds.nbcnews.com/feeds/topstories", country: "US", lang: "en" },
    { name: "The Guardian", url: "http://www.theguardian.com/world/usa/rss", country: "GB", lang: "en" },
    // { name: "Newsweek", url: "https://www.newsweek.com/rss", country: "US", lang: "en" },
    { name: "ABC News", url: "http://feeds.abcnews.com/abcnews/usheadlines", country: "US", lang: "en" },
    { name: "Deadline", url: "http://deadline.com/feed/", country: "US", lang: "en" },
    { name: "Vulture", url: "http://feeds.feedburner.com/nymag/vulture", country: "US", lang: "en" },
    { name: "CNN", url: "http://rss.cnn.com/rss/cnn_showbiz.rss", country: "US", lang: "en" },
    { name: "Esquire", url: "http://www.esquire.com/blogs/culture/culture-rss", country: "US", lang: "en" },
    { name: "CBS News", url: "http://www.cbsnews.com/latest/rss/entertainment", country: "US", lang: "en" },
    { name: "TMZ", url: "http://www.tmz.com/rss.xml", country: "US", lang: "en" },
    { name: "BuzzFeed", url: "http://www.buzzfeed.com/tvandmovies.xml", country: "US", lang: "en" },
    { name: "Variety", url: "http://variety.com/feed/", country: "US", lang: "en" },
    { name: "The New Yorker", url: "http://www.newyorker.com/feed/culture", country: "US", lang: "en" },
    { name: "Yahoo News", url: "http://news.yahoo.com/rss/entertainment", country: "US", lang: "en" },
    { name: "LA Times", url: "http://www.latimes.com/entertainment/rss2.0.xml", country: "US", lang: "en" },
    { name: "NBC News", url: "http://feeds.nbcnews.com/feeds/todayentertainment", country: "US", lang: "en" },
    { name: "ABC News", url: "http://feeds.abcnews.com/abcnews/entertainmentheadlines", country: "US", lang: "en" },
    { name: "Huffington Post", url: "https://www.huffpost.com/dept/entertainment/feed", country: "US", lang: "en" },
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
            // When called from the scheduler (cron), there is no user identity — that's safe by design.
            // When called directly by a user, we still require admin privileges.
            const identity = await ctx.auth.getUserIdentity();
            if (identity) {
                await requireAdmin(ctx.auth);
            }

            const fetchedKeyword = args.keyword?.trim() || "";

            // --- DIRECT URL SYNC FALLBACK OPTION ---
            if (fetchedKeyword && /^https?:\/\//i.test(fetchedKeyword)) {
                console.log(`🔗 [API Press Release Sync] Direct URL Sync detected for: ${fetchedKeyword}`);

                // 1. Extract content from direct URL
                let extracted = await extractWithDirectScraper(fetchedKeyword, true);

                if (!extracted) {
                    const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
                    if (worldnewsKey) {
                        extracted = await extractWithWorldNews(fetchedKeyword, worldnewsKey, true);
                    }
                }

                if (extracted) {
                    // 2. Identify the correct news agency from PR_WIRE_FEEDS based on domain matching
                    let matchedCountry = "AE";
                    let matchedLang = "ar";
                    let matchedPublisher = new URL(fetchedKeyword).hostname;

                    try {
                        const itemHost = new URL(fetchedKeyword).hostname.toLowerCase();
                        const foundFeed = PR_WIRE_FEEDS.find(f => f.url.toLowerCase().includes(itemHost) || itemHost.includes(f.name.toLowerCase()));
                        if (foundFeed) {
                            matchedCountry = foundFeed.country;
                            matchedLang = foundFeed.lang;
                            matchedPublisher = foundFeed.name;
                        }
                    } catch { }

                    // 3. Process and Save the Article (bypassing boolean filter since it is a direct URL sync)
                    const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
                    const processed = await processArticle(
                        ctx,
                        {
                            title: extracted.title || "No Title",
                            link: fetchedKeyword,
                            pubDate: extracted.publish_date || new Date().toISOString(),
                            contentSnippet: extracted.text || (extracted as any).description || "",
                            imageUrl: extracted.image || undefined
                        },
                        matchedCountry,
                        matchedLang,
                        fetchedKeyword, // Passes URL as keyword which bypasses boolean filter in processArticle
                        geminiKey,
                        ["Press Release"],
                        null,
                        null,
                        false, // shouldResolve: false (already resolved)
                        "Press Release"
                    );

                    if (processed) {
                        return {
                            success: true,
                            totalSaved: 1,
                            totalErrors: 0,
                            feedResults: [{ name: matchedPublisher, status: "Success", saved: 1, total: 1 }],
                            message: `Direct URL Sync complete. Successfully ingested article from ${matchedPublisher}.`
                        };
                    }
                }

                return {
                    success: false,
                    totalSaved: 0,
                    totalErrors: 1,
                    feedResults: [{ name: new URL(fetchedKeyword).hostname, status: "Failed", error: "Extraction Failed" }],
                    message: "Failed to extract article content from the provided URL."
                };
            }

            const booleanExpr = parseBooleanKeyword(fetchedKeyword);
            const keyword = fetchedKeyword || "Press Release";
            const itemLimit = args.limit ?? 30;

            const dateFromObj = args.dateFrom ? new Date(args.dateFrom) : null;
            const dateToObj = args.dateTo ? new Date(args.dateTo + "T23:59:59Z") : null;
            const parser = new Parser({
                timeout: 10000,
                customFields: {
                    item: [
                        ['source', 'source'],
                        ['media:content', 'mediaContent'],
                        ['content:encoded', 'contentEncoded']
                    ]
                }
            });

            const twitterBearer = (await resolveApiKey(ctx, "X_BEARER_TOKEN", "twitterBearer")) || process.env.BEARER_TOKEN || null;
            const serperKey = await resolveApiKey(ctx, "SERPER_API_KEY", "serper");
            const bingKey = await resolveApiKey(ctx, "BING_API_KEY", "bing");

            let totalSaved = 0;
            let totalErrors = 0;
            const feedResults: any[] = [];

            // 1.5 Parallel Google News Search restricting to PR feed domains
            if (fetchedKeyword) {
                console.log(`🔍 [Press Release Search Engine] Keyword search detected: "${fetchedKeyword}". Launching Google News domain-restricted search...`);

                // Extract clean domain names from PR_WIRE_FEEDS
                const domains = PR_WIRE_FEEDS
                    .map(feed => {
                        try {
                            if (feed.url.includes("twitter.com") || feed.url.includes("x.com") || feed.url.includes("feedburner.com")) {
                                return null;
                            }
                            const u = new URL(feed.url);
                            let host = u.hostname.toLowerCase();
                            if (host.startsWith("www.")) host = host.substring(4);
                            if (host.startsWith("feeds.")) host = host.substring(6);
                            if (host.startsWith("rss.")) host = host.substring(4);
                            return host;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as string[];

                // Remove duplicate domains if any
                const uniqueDomains = Array.from(new Set(domains));

                // Batch domains into chunks of 10 to avoid Google News query overflow limits
                const batchSize = 10;
                const batches: string[][] = [];
                for (let i = 0; i < uniqueDomains.length; i += batchSize) {
                    batches.push(uniqueDomains.slice(i, i + batchSize));
                }

                console.log(`📦 Domain-restricted search: Batched ${uniqueDomains.length} domains into ${batches.length} chunks`);

                await Promise.all(
                    batches.map(async (batch, batchIndex) => {
                        try {
                            const siteRestrictions = batch.map(d => `site:${d}`).join(" OR ");
                            const cleanQuery = buildApiQuery(fetchedKeyword);
                            const finalQuery = `"${cleanQuery}" (${siteRestrictions})`;

                            const hl = "ar-AE";
                            const gl = "AE";
                            const ceid = "AE:ar";
                            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(finalQuery)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

                            console.log(`📡 [Press Release Search Engine] Batch ${batchIndex + 1}/${batches.length} fetching: ${rssUrl.substring(0, 100)}...`);

                            const xml = await fetchRobustRss(rssUrl);
                            const feedData = await parser.parseString(xml);
                            console.log(`✅ [Press Release Search Engine] Batch ${batchIndex + 1} found ${feedData.items?.length || 0} indexed articles`);

                            const rawItems = feedData.items.slice(0, 15);
                            let savedCount = 0;

                            const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

                            for (const item of rawItems) {
                                if (!item.link || !item.title) continue;
                                const isSeen = await checkAndSetSeen(item.link, item.title);
                                if (isSeen) continue;

                                let matchedCountry = "AE";
                                let matchedLang = "ar";
                                let matchedPublisher = new URL(item.link).hostname;

                                try {
                                    const itemSource = (item.source || "").toLowerCase().trim();
                                    const foundFeed = PR_WIRE_FEEDS.find(f => 
                                        f.name.toLowerCase().includes(itemSource) || 
                                        itemSource.includes(f.name.toLowerCase())
                                    );
                                    if (foundFeed) {
                                        matchedCountry = foundFeed.country;
                                        matchedLang = foundFeed.lang;
                                        matchedPublisher = foundFeed.name;
                                    } else {
                                        const itemHost = new URL(item.link).hostname.toLowerCase();
                                        const foundHostFeed = PR_WIRE_FEEDS.find(f => f.url.toLowerCase().includes(itemHost) || itemHost.includes(f.name.toLowerCase()));
                                        if (foundHostFeed) {
                                            matchedCountry = foundHostFeed.country;
                                            matchedLang = foundHostFeed.lang;
                                            matchedPublisher = foundHostFeed.name;
                                        }
                                    }
                                } catch { }

                                const processed = await processArticle(
                                    ctx,
                                    {
                                        ...item,
                                        link: item.link,
                                        pubDate: item.pubDate,
                                        source: normalizePublisherName(matchedPublisher)
                                    },
                                    matchedCountry,
                                    matchedLang,
                                    keyword,
                                    geminiKey,
                                    ["Press Release"],
                                    dateFromObj,
                                    dateToObj,
                                    true,
                                    "Press Release"
                                );

                                if (processed) {
                                    savedCount++;
                                    totalSaved++;
                                }
                            }

                            if (savedCount > 0) {
                                feedResults.push({ name: `Search Engine (Batch ${batchIndex + 1})`, status: "Success", saved: savedCount, total: rawItems.length });
                            }
                        } catch (err: any) {
                            console.error(`❌ [Press Release Search Engine] Batch ${batchIndex + 1} failed:`, err.message || err);
                        }
                    })
                );

                // 1.6 Parallel Serper Standard Web Search
                if (serperKey) {
                    console.log(`🧠 [Press Release Search Engine] Serper.dev Key found. Running standard Google Search in parallel for batches...`);
                    await Promise.all(
                        batches.map(async (batch, batchIndex) => {
                            try {
                                const siteRestrictions = batch.map(d => `site:${d}`).join(" OR ");
                                const cleanQuery = buildApiQuery(fetchedKeyword);
                                const finalQuery = `"${cleanQuery}" (${siteRestrictions})`;

                                console.log(`📡 [Press Release Serper Web Search] Batch ${batchIndex + 1}/${batches.length} fetching...`);
                                const serperRes = await fetch("https://google.serper.dev/search", {
                                    method: "POST",
                                    headers: {
                                        "X-API-KEY": serperKey,
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        q: finalQuery,
                                        gl: "ae",
                                        hl: "ar",
                                        num: 15
                                    })
                                });

                                if (serperRes.ok) {
                                    const serperData = await serperRes.json();
                                    const organic = serperData.organic || [];
                                    console.log(`✅ [Press Release Serper Web Search] Batch ${batchIndex + 1} found ${organic.length} indexed articles`);

                                    let savedCount = 0;
                                    const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

                                    for (const item of organic) {
                                        if (!item.link || !item.title) continue;
                                        const isSeen = await checkAndSetSeen(item.link, item.title);
                                        if (isSeen) continue;

                                        let matchedCountry = "AE";
                                        let matchedLang = "ar";
                                        let matchedPublisher = new URL(item.link).hostname;

                                        try {
                                            const itemHost = new URL(item.link).hostname.toLowerCase();
                                            const foundFeed = PR_WIRE_FEEDS.find(f => f.url.toLowerCase().includes(itemHost) || itemHost.includes(f.name.toLowerCase()));
                                            if (foundFeed) {
                                                matchedCountry = foundFeed.country;
                                                matchedLang = foundFeed.lang;
                                                matchedPublisher = foundFeed.name;
                                            }
                                        } catch { }

                                        const parsedDate = parseRelativeDate(item.date);

                                        const processed = await processArticle(
                                            ctx,
                                            {
                                                title: item.title,
                                                link: item.link,
                                                pubDate: parsedDate,
                                                contentSnippet: item.snippet || item.title,
                                                imageUrl: item.imageUrl || undefined,
                                                source: normalizePublisherName(matchedPublisher)
                                            },
                                            matchedCountry,
                                            matchedLang,
                                            keyword,
                                            geminiKey,
                                            ["Press Release"],
                                            dateFromObj,
                                            dateToObj,
                                            true,
                                            "Press Release"
                                        );

                                        if (processed) {
                                            savedCount++;
                                            totalSaved++;
                                        }
                                    }

                                    if (savedCount > 0) {
                                        feedResults.push({ name: `Serper Web Search (Batch ${batchIndex + 1})`, status: "Success", saved: savedCount, total: organic.length });
                                    }
                                }
                            } catch (err: any) {
                                console.error(`❌ [Press Release Serper Search] Batch ${batchIndex + 1} failed:`, err.message || err);
                            }
                        })
                    );
                }

                // 1.7 Parallel Bing Standard Web Search
                if (bingKey) {
                    console.log(`🧠 [Press Release Search Engine] Bing Key found. Running standard Bing Search in parallel for batches...`);
                    await Promise.all(
                        batches.map(async (batch, batchIndex) => {
                            try {
                                const siteRestrictions = batch.map(d => `site:${d}`).join(" OR ");
                                const cleanQuery = buildApiQuery(fetchedKeyword);
                                const finalQuery = `"${cleanQuery}" (${siteRestrictions})`;

                                console.log(`📡 [Press Release Bing Search] Batch ${batchIndex + 1}/${batches.length} fetching...`);
                                const bingRes = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(finalQuery)}&count=15&mkt=ar-AE&safeSearch=Moderate`, {
                                    headers: {
                                        "Ocp-Apim-Subscription-Key": bingKey
                                    }
                                });

                                if (bingRes.ok) {
                                    const bingData = await bingRes.json();
                                    const webPages = bingData.webPages?.value || [];
                                    console.log(`✅ [Press Release Bing Search] Batch ${batchIndex + 1} found ${webPages.length} indexed articles`);

                                    let savedCount = 0;
                                    const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

                                    for (const item of webPages) {
                                        if (!item.url || !item.name) continue;
                                        const isSeen = await checkAndSetSeen(item.url, item.name);
                                        if (isSeen) continue;

                                        let matchedCountry = "AE";
                                        let matchedLang = "ar";
                                        let matchedPublisher = new URL(item.url).hostname;

                                        try {
                                            const itemHost = new URL(item.url).hostname.toLowerCase();
                                            const foundFeed = PR_WIRE_FEEDS.find(f => f.url.toLowerCase().includes(itemHost) || itemHost.includes(f.name.toLowerCase()));
                                            if (foundFeed) {
                                                matchedCountry = foundFeed.country;
                                                matchedLang = foundFeed.lang;
                                                matchedPublisher = foundFeed.name;
                                            }
                                        } catch { }

                                        const parsedDate = item.datePublished || item.dateLastCrawled || new Date().toISOString();

                                        const processed = await processArticle(
                                            ctx,
                                            {
                                                title: item.name,
                                                link: item.url,
                                                pubDate: parsedDate,
                                                contentSnippet: item.snippet || item.name,
                                                source: normalizePublisherName(matchedPublisher)
                                            },
                                            matchedCountry,
                                            matchedLang,
                                            keyword,
                                            geminiKey,
                                            ["Press Release"],
                                            dateFromObj,
                                            dateToObj,
                                            true,
                                            "Press Release"
                                        );

                                        if (processed) {
                                            savedCount++;
                                            totalSaved++;
                                        }
                                    }

                                    if (savedCount > 0) {
                                        feedResults.push({ name: `Bing Web Search (Batch ${batchIndex + 1})`, status: "Success", saved: savedCount, total: webPages.length });
                                    }
                                }
                            } catch (err: any) {
                                console.error(`❌ [Press Release Bing Search] Batch ${batchIndex + 1} failed:`, err.message || err);
                            }
                        })
                    );
                }
            }

            // 1. Parallel RSS & Twitter Ingestion with concurrency control (chunk size of 5)
            // to avoid Cloudflare rate-limiting/403 blocks and local scraper service overload.
            const chunkSize = 5;
            for (let i = 0; i < PR_WIRE_FEEDS.length; i += chunkSize) {
                const chunk = PR_WIRE_FEEDS.slice(i, i + chunkSize);
                await Promise.all(
                    chunk.map(async (feed) => {
                        let savedCount = 0;
                        try {
                            let candidates: any[] = [];
                            const isTwitter = feed.url.includes("twitter.com") || feed.url.includes("x.com");

                            if (isTwitter) {
                                let username = "";
                                if (feed.url.includes("screen-name=")) {
                                    const match = feed.url.match(/screen-name=([^&]+)/);
                                    if (match) username = match[1];
                                } else {
                                    const match = feed.url.match(/(?:twitter|x)\.com\/([^\/\?]+)/);
                                    if (match) username = match[1];
                                }
                                if (username) {
                                    candidates = await fetchTwitterTweets(username, twitterBearer);
                                }
                            } else {
                                const xml = await fetchRobustRss(feed.url);
                                const feedData = await parser.parseString(xml);
                                candidates = feedData.items;
                            }

                            const rawItems = candidates.slice(0, itemLimit);

                            const items = rawItems.filter((item) => {
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

                                if (!fetchedKeyword) {
                                    // Background live feed sweep -> save to rss_feed_articles
                                    const pubDate = item.pubDate ? new Date(item.pubDate) : null;
                                    const d = pubDate && !isNaN(pubDate.getTime()) ? pubDate : new Date();
                                    const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

                                    const snippet = item.contentSnippet || item.content || item.title || "";
                                    const isArabic = /[\u0600-\u06FF]/.test(item.title + snippet);
                                    const language = isArabic ? "AR" : (feed.lang === "ar" ? "AR" : "EN");

                                    const imageUrl = (item as any).image || (item as any).imageUrl || undefined;

                                    await ctx.runMutation(api.monitoring.saveRssArticle, {
                                        url: item.link,
                                        title: item.title,
                                        content: snippet,
                                        publishedDate: formattedDate,
                                        language,
                                        source: normalizePublisherName(feed.name) || new URL(item.link).hostname,
                                        sourceCountry: feed.country,
                                        imageUrl,
                                    });
                                    savedCount++;
                                    totalSaved++;
                                } else {
                                    // Specific keyword sweep -> save to media_monitoring_articles
                                    const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
                                    const processed = await processArticle(
                                        ctx,
                                        {
                                            ...item,
                                            link: item.link,
                                            pubDate: item.pubDate,
                                            source: normalizePublisherName(feed.name)
                                        },
                                        feed.country,
                                        feed.lang,
                                        keyword,
                                        geminiKey,
                                        isTwitter ? ["Social Media"] : ["Press Release"],
                                        dateFromObj,
                                        dateToObj,
                                        false,
                                        isTwitter ? "Social Media" : "Press Release"
                                    );
                                    if (processed) {
                                        savedCount++;
                                        totalSaved++;
                                    }
                                }
                            }

                            feedResults.push({ name: feed.name, status: "Success", saved: savedCount, total: items.length });
                        } catch (err: any) {
                            const message = err.message || String(err);
                            console.error(`❌ Feed Failed: ${feed.name}`, message);
                            let errorLabel = "Failed";
                            if (message.includes("HTML_RESPONSE")) errorLabel = "Private Site (HTML)";
                            else if (message.includes("HTTP_403")) errorLabel = "Access Denied (403)";
                            else if (message.includes("HTTP_404")) errorLabel = "Not Found (404)";
                            else if (message.includes("HTTP_429")) errorLabel = "Rate Limited (429)";
                            else if (message.includes("HTTP_4")) errorLabel = `Client Error (${message.match(/HTTP_(\d+)/)?.[1] || '4xx'})`;
                            else if (message.includes("HTTP_5")) errorLabel = `Server Error (${message.match(/HTTP_(\d+)/)?.[1] || '5xx'})`;
                            else if (message.includes("HTTP_400")) errorLabel = "Bad Request (400)";
                            else if (message.includes("timeout") || message.includes("Timeout")) errorLabel = "Timeout";
                            else if (message.includes("parse") || message.includes("XML") || message.includes("Invalid")) errorLabel = "XML Parse Error";
                            else if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) errorLabel = "DNS/Connection Error";

                            feedResults.push({ name: feed.name, status: "Failed", error: errorLabel, saved: 0 });
                            totalErrors++;
                        }
                    })
                );
            }

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


export const testAction = action({ args: {}, handler: async () => { const parser = new Parser(); return "ok"; } });

export const testCheerio = action({ args: {}, handler: async () => { const ch = require('cheerio'); return 'ok'; } });

export const testRssParser = action({ args: {}, handler: async () => { const Parser = require('rss-parser'); const parser = new Parser(); return 'ok'; } });

function normalizePublisherName(name: string): string {
    const n = name.trim();
    if (n === "WAM" || n === "WAM_AR") return "WAM (UAE)";
    if (n === "BBC News" || n === "BBC Arabic") return "BBC Arabic";
    return n;
}

async function executeRssSync(
    ctx: any,
    args: {
        feedUrl: string;
        publisher: string;
        country?: string;
        lang?: string;
        limit?: number;
    }
): Promise<{ success: boolean; savedCount: number; message: string }> {
    try {
        const url = args.feedUrl;
        const publisher = args.publisher;
        const country = args.country || "UAE";
        const lang = args.lang || "ar";
        const limit = args.limit ?? 10;

        const parser = new Parser({
            timeout: 10000,
            customFields: {
                item: [
                    ['source', 'source'],
                    ['media:content', 'mediaContent'],
                    ['content:encoded', 'contentEncoded']
                ]
            }
        });

        console.log(`📡 [executeRssSync] On-demand sync for publisher: ${publisher}, URL: ${url}`);

        const xml = await fetchRobustRss(url);
        const feedData = await parser.parseString(xml);
        const rawItems = feedData.items.slice(0, limit);

        let savedCount = 0;

        for (const item of rawItems) {
            if (!item.link || !item.title) continue;
            const isSeen = await checkAndSetSeen(item.link, item.title);
            if (isSeen) continue;

            // Format publication date to DD/MM/YYYY
            const pubDate = item.pubDate ? new Date(item.pubDate) : null;
            const d = pubDate && !isNaN(pubDate.getTime()) ? pubDate : new Date();
            const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

            // Language detection
            const snippet = item.contentSnippet || item.content || item.title || "";
            const isArabic = /[\u0600-\u06FF]/.test(item.title + snippet);
            const language = isArabic ? "AR" : (lang === "ar" ? "AR" : "EN");

            // Get image if available
            const imageUrl = (item as any).image || (item as any).imageUrl || undefined;

            await ctx.runMutation(api.monitoring.saveRssArticle, {
                url: item.link,
                title: item.title,
                content: snippet,
                publishedDate: formattedDate,
                language,
                source: publisher || new URL(item.link).hostname,
                sourceCountry: country,
                imageUrl,
            });
            savedCount++;
        }

        return {
            success: true,
            savedCount,
            message: `Successfully synced ${savedCount} new articles for ${publisher}.`
        };

    } catch (err) {
        console.error(`❌ [executeRssSync] Failed:`, err);
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            savedCount: 0,
            message: errMsg
        };
    }
}

export const syncSpecificRssFeed = action({
    args: {
        feedUrl: v.string(),
        publisher: v.string(),
        country: v.optional(v.string()),
        lang: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call");
        }
        return await executeRssSync(ctx, args);
    }
});

export const syncSpecificRssFeedBackground = internalAction({
    args: {
        feedUrl: v.string(),
        publisher: v.string(),
        country: v.optional(v.string()),
        lang: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await executeRssSync(ctx, args);
    }
});

function parseRelativeDate(dateStr: string | undefined): string {
    if (!dateStr) return new Date().toISOString();

    const now = new Date();
    const cleanStr = dateStr.toLowerCase().trim();

    // Check if it's already a valid date string
    const parsed = Date.parse(cleanStr);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString();
    }

    // Relative times in English (e.g. "3 days ago", "1 hour ago")
    const numMatch = cleanStr.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
    if (numMatch) {
        const value = parseInt(numMatch[1], 10);
        const unit = numMatch[2];

        switch (unit) {
            case 'second':
                now.setSeconds(now.getSeconds() - value);
                break;
            case 'minute':
                now.setMinutes(now.getMinutes() - value);
                break;
            case 'hour':
                now.setHours(now.getHours() - value);
                break;
            case 'day':
                now.setDate(now.getDate() - value);
                break;
            case 'week':
                now.setDate(now.getDate() - value * 7);
                break;
            case 'month':
                now.setMonth(now.getMonth() - value);
                break;
            case 'year':
                now.setFullYear(now.getFullYear() - value);
                break;
        }
        return now.toISOString();
    }

    // Relative times in Arabic (e.g. "قبل ٣ ساعة", "منذ 5 أيام")
    const arNumMatch = cleanStr.match(/(?:قبل|منذ)\s+([\d\u0660-\u0669]+)\s+(ثانية|دقيقة|ساعة|يوم|أسبوع|شهر|سنة|سنين|أيام|ساعات|دقائق)/);
    if (arNumMatch) {
        let valueStr = arNumMatch[1];
        // Convert Arabic numerals to English numerals
        valueStr = valueStr.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632));
        const value = parseInt(valueStr, 10);
        const unit = arNumMatch[2];

        if (unit.startsWith('ثاني')) now.setSeconds(now.getSeconds() - value);
        else if (unit.startsWith('دقيق')) now.setMinutes(now.getMinutes() - value);
        else if (unit.startsWith('ساع')) now.setHours(now.getHours() - value);
        else if (unit.startsWith('يوم') || unit === 'أيام') now.setDate(now.getDate() - value);
        else if (unit.startsWith('أسبوع')) now.setDate(now.getDate() - value * 7);
        else if (unit.startsWith('شهر')) now.setMonth(now.getMonth() - value);
        else if (unit.startsWith('سن') || unit === 'سنين') now.setFullYear(now.getFullYear() - value);

        return now.toISOString();
    }

    // Dual Arabic relative times
    if (cleanStr.includes('يومين')) {
        now.setDate(now.getDate() - 2);
        return now.toISOString();
    }
    if (cleanStr.includes('ساعتين')) {
        now.setHours(now.getHours() - 2);
        return now.toISOString();
    }
    if (cleanStr.includes('أسبوعين')) {
        now.setDate(now.getDate() - 14);
        return now.toISOString();
    }
    if (cleanStr.includes('شهرين')) {
        now.setMonth(now.getMonth() - 2);
        return now.toISOString();
    }

    // Singular Arabic relative times
    if (cleanStr.includes('ساعة')) {
        now.setHours(now.getHours() - 1);
        return now.toISOString();
    }
    if (cleanStr.includes('يوم')) {
        now.setDate(now.getDate() - 1);
        return now.toISOString();
    }
    if (cleanStr.includes('أسبوع')) {
        now.setDate(now.getDate() - 7);
        return now.toISOString();
    }
    if (cleanStr.includes('شهر')) {
        now.setMonth(now.getMonth() - 1);
        return now.toISOString();
    }
    if (cleanStr.includes('سنة')) {
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
    }

    return now.toISOString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISTRIBUTED SCRAPER QUEUE PROCESSOR
// Processes tasks sequentially in batches of 5 with 5-second throttling.
// ═══════════════════════════════════════════════════════════════════════════════
export const processQueueBatch = internalAction({
    args: {},
    handler: async (ctx) => {
        // 1. Try to acquire the lock. Only one instance of processQueueBatch should run.
        const acquired = await ctx.runMutation(api.monitoring.acquireQueueLock);
        if (!acquired) {
            console.log("🔒 [processQueueBatch] Another queue processor is active. Exiting.");
            return;
        }

        try {
            // 2. Fetch next batch of pending queue tasks
            const batch = await ctx.runMutation(api.monitoring.getPendingQueueBatch, { limit: 5 });
            if (batch.length === 0) {
                console.log("📭 [processQueueBatch] No pending queue items. Releasing lock.");
                await ctx.runMutation(api.monitoring.releaseQueueLock);
                return;
            }

            console.log(`📦 [processQueueBatch] Processing batch of ${batch.length} items.`);

            // 3. Process each item sequentially to limit concurrent loads on external servers
            for (const item of batch) {
                // Mark item as processing in DB
                await ctx.runMutation(api.monitoring.updateQueueItemStatus, {
                    id: item._id,
                    status: "processing"
                });

                try {
                    // Call the background analysis action for the article
                    await ctx.runAction(internal.monitoringAction.analyzeArticleBackground, {
                        articleId: item.articleId
                    });

                    // Mark as completed
                    await ctx.runMutation(api.monitoring.updateQueueItemStatus, {
                        id: item._id,
                        status: "completed"
                    });
                } catch (err) {
                    console.error(`❌ [processQueueBatch] Error processing queue item ${item._id}:`, err);

                    const newRetryCount = item.retryCount + 1;
                    const status = newRetryCount >= 3 ? "failed" : "pending";

                    await ctx.runMutation(api.monitoring.updateQueueItemStatus, {
                        id: item._id,
                        status,
                        retryCount: newRetryCount,
                        error: String(err)
                    });
                }
            }

            // 4. Release the lock before scheduling the next loop
            await ctx.runMutation(api.monitoring.releaseQueueLock);

            // 5. Schedule the next loop run in 5 seconds to drain remaining queue items at a constant rate
            await ctx.scheduler.runAfter(5000, internal.monitoringAction.processQueueBatch, {});
        } catch (error) {
            console.error("🔥 [processQueueBatch] Critical processor failure:", error);
            // Ensure lock is released on critical failures
            await ctx.runMutation(api.monitoring.releaseQueueLock);
        }
    }
});


