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
import { requireAdmin } from "./utils/auth";
import { resolveApiKey } from "./utils/keys";
import { parseBooleanKeyword, matchesBooleanFilter, buildApiQuery } from "./utils/booleanFilter";
import { checkAndSetSeen } from "./utils/dedup";
import { sendResendEmail } from "./utils/email";
import { decodeHtmlBuffer, hasMojibake, tryRecoverMojibake } from "./utils/encoding";

// Import refactored modules
import { logger } from "./utils/logger";
import { resolveUrl, cleanUrl } from "./utils/urlResolver";
import { callGeminiForAnalysis, callGeminiRelevancyScore } from "./utils/gemini";
import { extractWithWorldNews, extractWithDirectScraper, extractWithPlaywrightScraper } from "./utils/scraper";
import {
    DEFAULT_REACH,
    SOCIAL_REACH,
    RELEVANCY_THRESHOLD,
    SCRAPER_TIMEOUT,
    MAX_REDIRECTS,
    FETCH_TIMEOUT
} from "./utils/constants";

// Helper to avoid code duplication
const VALID_SOURCE_TYPES = ["Online News", "Social Media", "Blog", "Print", "Press Release"] as const;
type ValidSourceType = typeof VALID_SOURCE_TYPES[number];

function sanitizeSourceType(val: string | undefined): ValidSourceType {
    if (val && VALID_SOURCE_TYPES.includes(val as ValidSourceType)) return val as ValidSourceType;
    return "Online News";
}

function getScraperUrl(): string {
    const base = process.env.SCRAPER_SERVICE_URL || "http://127.0.0.1:3002";
    return base.endsWith("/scrape") ? base : `${base.replace(/\/+$/, "")}/scrape`;
}

// ── GET ARTICLE REACH WITH SIMILARWEB INTEGRATION ────────────────────────────

async function getArticleReach(
    ctx: any,
    urlStr: string,
    sourceType: string,
    aiReachEstimate: number
): Promise<{ reach: number; source: string }> {
    const log = logger.child({ requestId: "similarweb-reach" });
    const validReachTypes = ["Online News", "Blog", "Press Release"];
    if (!validReachTypes.includes(sourceType)) {
        return { reach: aiReachEstimate || SOCIAL_REACH, source: "ai" };
    }

    try {
        const url = new URL(urlStr);
        let domain = url.hostname.toLowerCase();
        if (domain.startsWith("www.")) {
            domain = domain.substring(4);
        }

        if (!domain) {
            return { reach: aiReachEstimate || DEFAULT_REACH, source: "fallback" };
        }

        // 1. Check if SimilarWeb API Key is configured
        const similarwebKey = await resolveApiKey(ctx, "SIMILARWEB_API_KEY", "similarweb");
        if (!similarwebKey || similarwebKey === "None") {
            return { reach: aiReachEstimate || DEFAULT_REACH, source: "ai_no_key" };
        }

        // 2. Check if we have cached traffic volume for this domain
        const cached = await ctx.runQuery(api.monitoring.getCachedDomainTraffic, { domain });
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        let monthlyVisits: number | null = null;

        if (cached && (Date.now() - cached.lastFetchedAt) < THIRTY_DAYS) {
            log.info(`[SimilarWeb Cache] Found cached traffic for ${domain}: ${cached.monthlyVisits} visits`);
            monthlyVisits = cached.monthlyVisits;
        } else {
            // 3. Fetch from SimilarWeb API
            log.info(`[SimilarWeb API] Fetching traffic for ${domain}...`);
            const apiUrl = `https://api.similarweb.com/v1/website/${encodeURIComponent(domain)}/total-traffic-and-engagement/visits?api_key=${encodeURIComponent(similarwebKey)}&country=world&granularity=monthly`;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

            try {
                const response = await fetch(apiUrl, {
                    headers: { "Accept": "application/json" },
                    signal: controller.signal,
                });

                if (response.ok) {
                    const data = await response.json() as any;
                    if (data && Array.isArray(data.visits) && data.visits.length > 0) {
                        const sortedVisits = [...data.visits].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const latestPeriod = sortedVisits[sortedVisits.length - 1];
                        if (latestPeriod && typeof latestPeriod.visits === "number") {
                            monthlyVisits = latestPeriod.visits;
                            log.info(`[SimilarWeb API] Traffic for ${domain}: ${monthlyVisits} visits`);

                            // Save to cache
                            await ctx.runMutation(api.monitoring.saveCachedDomainTraffic, {
                                domain,
                                monthlyVisits
                            });
                        }
                    }
                } else {
                    log.warn(`[SimilarWeb API] Error or no data for ${domain}: ${response.statusText} (${response.status})`);
                }
            } finally {
                clearTimeout(timeout);
            }
        }

        if (monthlyVisits !== null && monthlyVisits > 0) {
            // Estimate article reach as 1% of the domain's monthly visits, bounded between 1,000 and 10,000,000.
            let reachVal = Math.round(monthlyVisits / 100);
            if (reachVal < 1000) reachVal = 1000;
            if (reachVal > 10000000) reachVal = 10000000;

            log.info(`[SimilarWeb Reach] Domain monthly visits: ${monthlyVisits} => Article Reach (Visits/100): ${reachVal}`);
            return { reach: reachVal, source: "similarweb" };
        }
    } catch (err: any) {
        log.error(`[SimilarWeb Reach Estimation] Failed for ${urlStr}: ${err.message || err}`);
    }

    return { reach: aiReachEstimate || DEFAULT_REACH, source: "ai_fallback" };
}

// ── ARTICLE PROCESSOR ────────────────────────────────────────────────────────

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
): Promise<boolean> {
    const log = logger.child({ keyword, articleId: item.link });
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
            log.info(`⚡ Boolean reject: "${item.title.substring(0, 60)}..."`);
            return false;
        }

        // ── GATE 2: Date Filter ─────────────────────────────────────────────
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (pubDate) {
            if (dateFrom && pubDate < dateFrom) {
                log.info(`📅 [Gate 2] Date reject (Too old): ${item.link}`);
                return false;
            }
            if (dateTo && pubDate > dateTo) {
                log.info(`📅 [Gate 2] Date reject (Too new): ${item.link}`);
                return false;
            }
        }

        // ── GATE 3: Deduplication (24-hour hash cache) ──────────────────────
        const isDuplicate = await checkAndSetSeen(item.link, item.title);
        if (isDuplicate) {
            log.info(`♻️ [Gate 3] Deduplication: Skipped duplicate link/title`);
            return false;
        }

        const resolvedUrl = item.link;
        const imageUrl = item.imageUrl;
        const sourceName = item.source || item.creator;

        const parsedSourceType = sanitizeSourceType(forceSourceType);
        const d = pubDate || new Date();
        const formattedDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

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
            reach: DEFAULT_REACH,
            ave: 5000,
            imageUrl: imageUrl,
            likes: item.likes,
            retweets: item.retweets,
            replies: item.replies,
            analysisStatus: "pending",
            ingestMethod: shouldResolve ? "rss" : "api",
        });

        return true;
    } catch (error: any) {
        log.error(`❌ Article processing failed: ${error.message || error}`);
        return false;
    }
}

// ── THE BRAIN ─ MAIN fetchNews Action ────────────────────────────────────────

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
        const log = logger.child({ requestId: "fetch-news", keyword: args.keyword });
        try {
            await requireAdmin(ctx.auth);
            const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            if (!apiKey) {
                log.warn("⚠️ Gemini API key is missing. Falling back to Heuristic Engine for analysis.");
            }

            log.info("Starting resolution...");
            const newsdataKey = await resolveApiKey(ctx, "NEWSDATA_API_KEY", "newsdata");
            const newsapiKey = await resolveApiKey(ctx, "NEWSAPI_API_KEY", "newsapi");
            const gnewsKey = await resolveApiKey(ctx, "GNEWS_API_KEY", "gnews");
            const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
            const twitterBearer = await resolveApiKey(ctx, "X_BEARER_TOKEN", "twitterBearer");
            const bingKey = await resolveApiKey(ctx, "BING_API_KEY", "bing");
            const mediastackKey = await resolveApiKey(ctx, "MEDIASTACK_API_KEY", "mediastack");
            const serperKey = await resolveApiKey(ctx, "SERPER_API_KEY", "serper");

            const providers = [
                { name: "NewsData.io", key: newsdataKey, type: "newsdata" },
                { name: "NewsAPI.org", key: newsapiKey, type: "newsapi" },
                { name: "GNews.io", key: gnewsKey, type: "gnews" },
                { name: "WorldNews API", key: worldnewsKey, type: "worldnews" },
                { name: "Twitter (X)", key: twitterBearer, type: "twitter" },
                { name: "Bing News", key: bingKey, type: "bing" },
                { name: "Mediastack", key: mediastackKey, type: "mediastack" },
                { name: "Serper.dev", key: serperKey, type: "serper" }
            ].filter(p => p.key);

            if (providers.length === 0) {
                return { success: false, error: "Missing news provider API keys. Please configure at least one in Settings." };
            }

            const ParserClass = (await import("rss-parser")).default;
            const parser = new ParserClass({
                timeout: 10000,
                customFields: {
                    item: [["source", "source"]]
                }
            });

            const isAllCountries = args.countries === 'ALL';
            const isAllLanguages = args.languages === 'ALL';

            const countryList = isAllCountries
                ? []
                : args.countries.split(",").map(c => c.trim().toLowerCase()).filter(Boolean);
            const languageList = isAllLanguages
                ? []
                : args.languages.split(",").map(l => l.trim().toLowerCase()).filter(Boolean);

            let dateFromObj: Date | null = null;
            let dateToObj: Date | null = null;
            if (args.dateFrom) {
                const parts = args.dateFrom.split("/");
                if (parts.length === 3) {
                    const [d, m, y] = parts;
                    dateFromObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                    if (isNaN(dateFromObj.getTime())) dateFromObj = null;
                }
            }
            if (args.dateTo) {
                const parts = args.dateTo.split("/");
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

            const cleanQuery = buildApiQuery(args.keyword);
            let enrichedQuery = cleanQuery.includes(" ") ? `"${cleanQuery}"` : cleanQuery;

            const stList = args.sourceTypes ? args.sourceTypes.split(",").map(s => s.trim()) : [];
            if (stList.includes("Press Release")) {
                enrichedQuery += " (site:prnewswire.com OR site:businesswire.com OR site:zawya.com OR site:wam.ae OR site:globenewswire.com OR site:einpresswire.com OR site:accesswire.com OR site:me-newswire.net OR site:spa.gov.sa OR site:newsfilecorp.com OR site:prweb.com OR site:marketwired.com OR site:prunderground.com OR site:eyeofriyadh.com OR site:eyeofdubai.ae OR site:saudigazette.com.sa OR site:arabnews.com OR site:gulfnews.com OR site:gulftoday.ae OR site:khaleejtimes.com OR site:thenationalnews.com OR site:thenational.ae OR site:aetoswire.com OR site:albawaba.com OR site:alarabiya.net OR site:skynewsarabia.com OR site:middleeasteye.net OR site:meed.com)";
            } else if (stList.includes("Social Media")) {
                enrichedQuery += " (site:twitter.com OR site:x.com OR site:reddit.com OR site:linkedin.com OR site:facebook.com OR site:instagram.com)";
            }

            if (dateFromObj && !isNaN(dateFromObj.getTime())) {
                const after = dateFromObj.toISOString().split("T")[0];
                enrichedQuery += ` after:${after}`;
            }
            if (dateToObj && !isNaN(dateToObj.getTime())) {
                const before = dateToObj.toISOString().split("T")[0];
                enrichedQuery += ` before:${before}`;
            }

            const rssCombos: { url: string; country: string; lang: string }[] = [];
            if (isAllCountries && isAllLanguages) {
                const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}`;
                rssCombos.push({ url: rssUrl, country: "US", lang: "en" });
            } else if (isAllCountries) {
                for (const lang of languageList) {
                    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}&hl=${lang}`;
                    rssCombos.push({ url: rssUrl, country: "US", lang });
                }
            } else if (isAllLanguages) {
                for (const country of countryList) {
                    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}&gl=${country.toUpperCase()}`;
                    rssCombos.push({ url: rssUrl, country: country.toUpperCase(), lang: "en" });
                }
            } else {
                for (const country of countryList) {
                    for (const lang of languageList) {
                        const hl = `${lang}-${country.toUpperCase()}`;
                        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(enrichedQuery)}&hl=${hl}&gl=${country.toUpperCase()}&ceid=${country.toUpperCase()}:${lang}`;
                        rssCombos.push({ url: rssUrl, country: country.toUpperCase(), lang });
                    }
                }
            }

            let totalSuccess = 0;
            const totalSkipped = 0;

            log.info("Starting parallel fetch...");
            const fetchPromises = [];

            // 1. Google News (RSS)
            for (const combo of rssCombos) {
                fetchPromises.push((async () => {
                    try {
                        log.info(`[RSS] Fetching: ${combo.url.substring(0, 100)}...`);
                        const xml = await fetchRobustRss(combo.url);
                        const feed = await parser.parseString(xml);
                        log.info(`[RSS] Got ${feed.items?.length || 0} items from ${combo.country}-${combo.lang}`);
                        const items = feed.items.slice(0, 10);
                        let localSuccess = 0;
                        for (const item of items) {
                            try {
                                const success = await processArticle(ctx, item, combo.country, combo.lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, true);
                                if (success) localSuccess++;
                            } catch (e: any) {
                                if (e.message === "MODEL_CAPACITY_EXHAUSTED") {
                                    throw e;
                                }
                            }
                        }
                        return { name: `RSS-${combo.country}`, success: localSuccess };
                    } catch (e: any) {
                        log.error(`RSS fail for ${combo.url}: ${e.message || e}`);
                        return { name: `RSS-${combo.country}`, error: true };
                    }
                })());
            }

            // 2. NewsData.io
            if (newsdataKey) {
                fetchPromises.push((async () => {
                    try {
                        let ndUrl = `https://newsdata.io/api/1/latest?apikey=${newsdataKey}&q=${encodeURIComponent(cleanQuery)}`;
                        if (!isAllLanguages && languageList.length > 0) ndUrl += `&language=${languageList.join(",")}`;
                        if (!isAllCountries && countryList.length > 0) ndUrl += `&country=${countryList.join(",")}`;

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
                                        contentSnippet: `Source: ${item.source_id || "Unknown"}. ${item.description || item.content || item.title}`,
                                        imageUrl: item.image_url
                                    }, (item.country?.[0] || countryList[0] || "US").toUpperCase(), item.language || languageList[0] || "en", args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: "NewsData.io", success: localSuccess };
                            }
                        }
                        return { name: "NewsData.io", error: true };
                    } catch (e: any) {
                        log.error(`NewsData.io fail: ${e.message || e}`);
                        return { name: "NewsData.io", error: true };
                    }
                })());
            }

            // 3. NewsAPI.org
            if (newsapiKey) {
                fetchPromises.push((async () => {
                    try {
                        const NewsAPIClass = require("newsapi");
                        const naClient = new NewsAPIClass(newsapiKey);
                        const naDateFrom = dateFromObj ? dateFromObj.toISOString().split("T")[0] : undefined;
                        const naDateTo = dateToObj ? dateToObj.toISOString().split("T")[0] : undefined;
                        let localSuccess = 0;

                        const targetLangs = isAllLanguages ? [undefined] : languageList;
                        for (const lang of targetLangs) {
                            const queryOpts: any = {
                                q: cleanQuery,
                                from: naDateFrom,
                                to: naDateTo,
                                sortBy: "publishedAt",
                                pageSize: 20
                            };
                            if (lang) {
                                queryOpts.language = lang as "en" | "ar";
                            }
                            const response = await naClient.v2.everything(queryOpts);

                            if (response.status === "ok" && response.articles) {
                                for (const item of response.articles) {
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.url,
                                        pubDate: item.publishedAt,
                                        contentSnippet: `Source: ${item.source?.name || "Unknown"}. ${item.description || item.content || item.title}`,
                                        imageUrl: item.urlToImage
                                    }, (countryList[0] || "US").toUpperCase(), lang || "en", args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                            }
                        }
                        return { name: "NewsAPI.org", success: localSuccess };
                    } catch (e: any) {
                        log.error(`NewsAPI.org fail: ${e.message || e}`);
                        return { name: "NewsAPI.org", error: true };
                    }
                })());
            }

            // 4. GNews.io
            if (gnewsKey) {
                fetchPromises.push((async () => {
                    try {
                        const gDateFrom = dateFromObj ? dateFromObj.toISOString().split(".")[0] + "Z" : "";
                        const gDateTo = dateToObj ? dateToObj.toISOString().split(".")[0] + "Z" : "";
                        let localSuccess = 0;

                        const targetLangs = isAllLanguages ? [undefined] : languageList;
                        const targetCountries = isAllCountries ? [undefined] : countryList;

                        for (const lang of targetLangs) {
                            for (const country of targetCountries) {
                                let gQuery = cleanQuery.trim();
                                if (gQuery.includes(" ") && !gQuery.startsWith('"')) gQuery = `"${gQuery}"`;
                                gQuery = gQuery.substring(0, 200);

                                let gUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(gQuery)}&max=20&apikey=${gnewsKey}&sortby=publishedAt&nullable=description,image`;
                                if (lang) gUrl += `&lang=${lang}`;
                                if (country) gUrl += `&country=${country}`;
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
                                                contentSnippet: `Source: ${item.source?.name || "Unknown"}. ${item.description || item.content || item.title}`,
                                                imageUrl: item.image
                                            }, (country || "US").toUpperCase(), lang || "en", args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                            if (success) localSuccess++;
                                        }
                                    }
                                }
                            }
                        }
                        return { name: "GNews.io", success: localSuccess };
                    } catch (e: any) {
                        log.error(`GNews.io fail: ${e.message || e}`);
                        return { name: "GNews.io", error: true };
                    }
                })());
            }

            // 5. WorldNews API
            if (worldnewsKey) {
                fetchPromises.push((async () => {
                    try {
                        const wnDateFrom = dateFromObj ? dateFromObj.toISOString().replace("T", " ").split(".")[0] : "";
                        let wnKeyword = cleanQuery.trim();
                        if (wnKeyword.includes(" ") && !wnKeyword.startsWith('"')) wnKeyword = `"${wnKeyword}"`;
                        wnKeyword = wnKeyword.substring(0, 100);
                        const country = isAllCountries ? "" : (countryList[0] || "ae").toLowerCase();

                        let wnUrl = `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(wnKeyword)}&number=20&sort=publish-time&sort-direction=DESC`;
                        if (!isAllLanguages && languageList.length > 0) wnUrl += `&language=${languageList.join(",")}`;
                        if (country) wnUrl += `&source-country=${country}`;
                        if (wnDateFrom) wnUrl += `&earliest-publish-date=${wnDateFrom}`;

                        const wnRes = await fetch(wnUrl, { headers: { "x-api-key": worldnewsKey } });
                        if (wnRes.ok) {
                            const wnData = await wnRes.json();
                            if (wnData.news) {
                                let localSuccess = 0;
                                for (const item of wnData.news) {
                                    const authorStr = Array.isArray(item.authors) ? item.authors.join(", ") : (item.author || "Unknown");
                                    const success = await processArticle(ctx, {
                                        title: item.title,
                                        link: item.url,
                                        pubDate: item.publish_date,
                                        contentSnippet: `Source: ${authorStr}. ${item.text || item.title}`,
                                        imageUrl: item.image
                                    }, (item.source_country || country || "US").toUpperCase(), item.language || languageList[0] || "en", args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: "WorldNews API", success: localSuccess };
                            }
                        }
                        return { name: "WorldNews API", error: true };
                    } catch (e: any) {
                        log.error(`WorldNews API fail: ${e.message || e}`);
                        return { name: "WorldNews API", error: true };
                    }
                })());
            }

            // 6. Twitter (X)
            if (twitterBearer) {
                fetchPromises.push((async () => {
                    try {
                        const txQuery = encodeURIComponent(cleanQuery);
                        const txUrl = `https://api.twitter.com/2/tweets/search/recent?query=${txQuery}&max_results=20&tweet.fields=created_at,author_id,entities,public_metrics&expansions=author_id`;
                        const txRes = await fetch(txUrl, { headers: { "Authorization": `Bearer ${twitterBearer}` } });

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
                                    }, (countryList[0] || "US").toUpperCase(), languageList[0] || "en", args.keyword, apiKey, stList, dateFromObj, dateToObj, false, "Social Media");
                                    if (success) localSuccess++;
                                }
                                return { name: "Twitter (X)", success: localSuccess };
                            }
                        }
                        return { name: "Twitter (X)", error: true };
                    } catch (e: any) {
                        log.error(`Twitter fail: ${e.message || e}`);
                        return { name: "Twitter (X)", error: true };
                    }
                })());
            }

            // 7. Bing News
            if (bingKey) {
                fetchPromises.push((async () => {
                    try {
                        const country = (countryList[0] || "us").toUpperCase();
                        const lang = languageList[0] || "en";
                        const bingUrl = `https://api.bing.microsoft.com/v7.0/news/search?q=${encodeURIComponent(cleanQuery)}&setLang=${lang}&cc=${country}&mkt=${lang}-${country}&count=20`;
                        const bingRes = await fetch(bingUrl, { headers: { "Ocp-Apim-Subscription-Key": bingKey } });

                        if (bingRes.ok) {
                            const bingData = await bingRes.json();
                            if (bingData.value) {
                                let localSuccess = 0;
                                for (const item of bingData.value) {
                                    const success = await processArticle(ctx, {
                                        title: item.name,
                                        link: item.url,
                                        pubDate: item.datePublished,
                                        contentSnippet: `Source: ${item.provider?.[0]?.name || "Unknown"}. ${item.description || item.name}`,
                                        imageUrl: item.image?.thumbnail?.contentUrl
                                    }, country, lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: "Bing News", success: localSuccess };
                            }
                        }
                        return { name: "Bing News", error: true };
                    } catch (e: any) {
                        log.error(`Bing News fail: ${e.message || e}`);
                        return { name: "Bing News", error: true };
                    }
                })());
            }

            // 8. Mediastack
            if (mediastackKey) {
                fetchPromises.push((async () => {
                    try {
                        let msUrl = `http://api.mediastack.com/v1/news?access_key=${mediastackKey}&keywords=${encodeURIComponent(cleanQuery)}&limit=20`;
                        if (!isAllLanguages && languageList.length > 0) msUrl += `&languages=${languageList.join(",")}`;
                        if (!isAllCountries && countryList.length > 0) msUrl += `&countries=${countryList.join(",")}`;

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
                                        contentSnippet: `Source: ${item.source || "Unknown"}. ${item.description || item.title}`,
                                        imageUrl: item.image
                                    }, (item.country || countryList[0] || "us").toUpperCase(), item.language || languageList[0] || "en", args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: "Mediastack", success: localSuccess };
                            }
                        }
                        return { name: "Mediastack", error: true };
                    } catch (e: any) {
                        log.error(`Mediastack fail: ${e.message || e}`);
                        return { name: "Mediastack", error: true };
                    }
                })());
            }

            // 9. Serper.dev (Google News via Serper)
            if (serperKey) {
                fetchPromises.push((async () => {
                    try {
                        const serperUrl = `https://google.serper.dev/news`;
                        const serperRes = await fetch(serperUrl, {
                            method: "POST",
                            headers: {
                                "X-API-KEY": serperKey,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                q: cleanQuery,
                                gl: isAllCountries ? "us" : (countryList[0] || "us"),
                                hl: isAllLanguages ? "en" : (languageList[0] || "en"),
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
                                        contentSnippet: `Source: ${item.source || "Unknown"}. ${item.snippet || item.title}`,
                                        imageUrl: item.imageUrl
                                    }, (isAllCountries ? "us" : (countryList[0] || "us")).toUpperCase(), (isAllLanguages ? "en" : (languageList[0] || "en")), args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                    if (success) localSuccess++;
                                }
                                return { name: "Serper.dev", success: localSuccess };
                            }
                        }
                        return { name: "Serper.dev", error: true };
                    } catch (e: any) {
                        log.error(`Serper.dev fail: ${e.message || e}`);
                        return { name: "Serper.dev", error: true };
                    }
                })());
            }

            // 10. GLEIF (Corporate Intelligence / Entity Lookups)
            fetchPromises.push((async () => {
                try {
                    const gleifUrl = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(cleanQuery)}&page[size]=5`;
                    const gleifRes = await fetch(gleifUrl);
                    if (gleifRes.ok) {
                        const gleifData = await gleifRes.json();
                        const records = gleifData?.data || [];
                        if (records.length > 0) {
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
                            return { name: "GLEIF", success: 1 };
                        }
                    }
                    return { name: "GLEIF", success: 0 };
                } catch (e: any) {
                    log.error(`GLEIF fail: ${e.message || e}`);
                    return { name: "GLEIF", error: true };
                }
            })());

            const results = await Promise.all(fetchPromises);
            results.forEach(r => {
                if ("success" in r) totalSuccess += r.success || 0;
            });

            log.info(`Parallel Fetch Complete: ${totalSuccess} saved articles.`);
            return { success: true, count: totalSuccess, skipped: totalSkipped, feeds: results.length };
        } catch (globalError: any) {
            if (globalError.message === "MODEL_CAPACITY_EXHAUSTED") {
                log.warn(`Terminating fetchNews early due to AI capacity exhaustion. Retry after ${globalError.retryAfter}s`);
                return {
                    success: false,
                    error: "AI_CAPACITY_EXHAUSTED",
                    capacityExhausted: true,
                    retryAfter: globalError.retryAfter || 60
                };
            }
            log.error("CRITICAL: Global fetchNews failure", globalError);
            const errorMessage = globalError instanceof Error ? globalError.message : String(globalError);
            const stack = globalError instanceof Error ? globalError.stack : "No stack trace";
            return {
                success: false,
                error: `Unable to process news monitoring: ${errorMessage} | Stack: ${stack}`
            };
        }
    },
});

// ── THE EXTRACTOR ── Direct URL to Article Extraction ───────────────────────

export const extractArticle = action({
    args: {
        url: v.string(),
        analyze: v.optional(v.boolean()),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: any; error?: string }> => {
        const log = logger.child({ requestId: "extract-article", articleId: args.url });
        try {
            const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
            let result = null;
            if (worldnewsKey) {
                result = await extractWithWorldNews(args.url, worldnewsKey, args.analyze || false);
            }

            if (!result) {
                log.info("WorldNews extractor unavailable or failed. Trying direct scraper...");
                result = await extractWithDirectScraper(args.url, args.analyze || false);
            }

            if (!result) {
                log.info("Direct scraper failed. Trying premium Playwright Scraper microservice...");
                result = await extractWithPlaywrightScraper(args.url, args.analyze || false);
            }

            if (result) {
                // Normalize image field
                if (!result.image) {
                    if (result.imageUrl) {
                        result.image = result.imageUrl;
                    } else if (Array.isArray(result.images) && result.images.length > 0) {
                        const firstImg = result.images[0];
                        if (typeof firstImg === "string") {
                            result.image = firstImg;
                        } else if (firstImg && typeof firstImg === "object" && firstImg.url) {
                            result.image = firstImg.url;
                        }
                    }
                }

                // Normalize and validate publish_date
                if (result.publish_date) {
                    const parsed = Date.parse(result.publish_date);
                    if (isNaN(parsed) || parsed < Date.parse("2000-01-01") || parsed > Date.now() + 86400000 * 2) {
                        result.publish_date = new Date().toISOString();
                    } else {
                        result.publish_date = new Date(parsed).toISOString();
                    }
                } else {
                    result.publish_date = new Date().toISOString();
                }

                // Fetch reach estimate
                const lowerUrl = args.url.toLowerCase();
                const isSocial = lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com") || lowerUrl.includes("reddit.com") || lowerUrl.includes("instagram.com") || lowerUrl.includes("facebook.com") || lowerUrl.includes("youtube.com") || lowerUrl.includes("tiktok.com");
                const st = isSocial ? "Social Media" : "Online News";
                try {
                    const reachRes = await getArticleReach(ctx, args.url, st, isSocial ? SOCIAL_REACH : DEFAULT_REACH);
                    result.reach = reachRes.reach;
                } catch (reachErr: any) {
                    log.error(`Failed to estimate reach during extraction: ${reachErr.message || reachErr}`);
                    result.reach = isSocial ? SOCIAL_REACH : DEFAULT_REACH;
                }
            }

            return { success: !!result, data: result };
        } catch (error: any) {
            log.error(`Extract error: ${error.message || error}`);
            return { success: false, error: "Failed to extract article content." };
        }
    }
});

// ── BACKGROUND ARTICLE ANALYSIS ──────────────────────────────────────────────

export const analyzeArticleBackground = internalAction({
    args: { articleId: v.id("media_monitoring_articles") },
    handler: async (ctx, { articleId }) => {
        const log = logger.child({ requestId: "background-analysis", articleId });
        try {
            const article = await ctx.runQuery(api.monitoring.getArticle, { id: articleId });
            if (!article) {
                log.error(`Article ${articleId} not found.`);
                return;
            }

            const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            // 1. Resolve URL in background if ingestMethod is "rss"
            let resolvedUrl = article.resolvedUrl || article.url;
            let imageUrl = article.imageUrl;
            let sourceName = article.source;

            if (article.ingestMethod === "rss") {
                log.info(`🕷️ [Background Resolve] Resolving URL: ${article.url}`);
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
                const cleanTitle = article.title.replace(/\s*[-–|]\s*Google\s*(?:News)?\s*$/i, "").trim();
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
                    log.info(`⚠️ [Background Filter] Low relevancy (${relevancyScore}/100) — deleting article: "${article.title.substring(0, 60)}"`);
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
            const depth = (aiData.risk === "High" || aiData.risk === "Critical") ? "deep" : "standard";

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
                log.info(`🔍 [Background Deep Promotion] Article promoted.`);
                ctx.runAction(api.osint.lookupNews, { query: article.keyword }).catch(log.error);
                ctx.runAction(api.darkWeb.searchAhmia, { query: article.keyword }).catch(log.error);
            }

            // 6. Notifications for critical/press release
            const isPressRelease = parsedSourceType === "Press Release";
            const isCritical = aiData.risk === "High" || aiData.risk === "Critical" || aiData.sentiment === "Negative";

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
                } catch (err: any) {
                    log.error("Notification/Email failed", err);
                }
            }

            log.info("Completed background analysis");
        } catch (error: any) {
            log.error(`Background analysis failed: ${error.message || error}`);
            try {
                await ctx.runMutation(api.monitoring.updateArticleAfterAnalysis, {
                    id: articleId,
                    sentiment: "Neutral",
                    analysisStatus: "failed",
                    reach: DEFAULT_REACH,
                    ave: 5000,
                });
            } catch (updateErr: any) {
                log.error(`Failed to update status for ${articleId}: ${updateErr.message || updateErr}`);
            }
        }
    }
});

// ── HISTORICAL SEARCH ────────────────────────────────────────────────────────

async function fetchHistoricalArticles(
    ctx: any,
    keyword: string,
    dateFrom: string | null,
    dateTo: string | null,
    limit: number = 30
): Promise<Array<{ link: string; title: string; contentSnippet: string; pubDate: string; source: string }>> {
    const log = logger.child({ requestId: "historical-search", keyword });
    const newsApiKey = await resolveApiKey(ctx, "NEWSAPI_KEY", "newsapi");
    if (!newsApiKey) return [];

    try {
        const query = encodeURIComponent(keyword);
        let url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=${Math.min(limit, 100)}&apiKey=${newsApiKey}`;
        if (dateFrom) url += `&from=${dateFrom}`;
        if (dateTo) url += `&to=${dateTo}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

        try {
            const response = await fetch(url, { signal: controller.signal });
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
        } finally {
            clearTimeout(timeout);
        }
    } catch (error: any) {
        log.warn(`Error fetching from NewsAPI: ${error.message || error}`);
        return [];
    }
}

// ── ROBUST RSS FETCH ─────────────────────────────────────────────────────────

async function fetchRobustRss(url: string): Promise<string> {
    const log = logger.child({ requestId: "robust-rss", articleId: url });
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5,ar;q=0.3",
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                },
                redirect: "follow",
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP_${response.status}`);
            }

            const buffer = await response.arrayBuffer();
            let xml = decodeHtmlBuffer(buffer, response.headers.get("content-type"));

            // Sanitization for AETOSWire and others with potential malformed XML
            xml = xml.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/g, "");

            const trimmedXml = xml.trim().toLowerCase();
            const isHtml = trimmedXml.startsWith("<!doctype html") ||
                trimmedXml.startsWith("<html") ||
                trimmedXml.startsWith("<doctype html");
            if (isHtml) {
                throw new Error("HTML_RESPONSE");
            }
            return xml;
        } finally {
            clearTimeout(timeout);
        }
    } catch (error: any) {
        log.warn(`Direct fetch failed: ${error.message || error}. Trying Playwright Scraper Service...`);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

            try {
                const scraperRes = await fetch(getScraperUrl(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url, timeout: 12000, waitAfterLoad: 0 }),
                    signal: controller.signal
                });

                if (scraperRes.ok) {
                    const scraperData = await scraperRes.json() as any;
                    if (scraperData.success && (scraperData.rawContent || scraperData.rawContentBase64)) {
                        log.info(`Playwright Scraper successfully fetched RSS XML`);
                        let xml = "";
                        if (scraperData.rawContentBase64) {
                            const buffer = Buffer.from(scraperData.rawContentBase64, "base64");
                            xml = decodeHtmlBuffer(buffer, scraperData.contentType || scraperData.headers?.["content-type"]);
                        } else {
                            xml = scraperData.rawContent || "";
                        }

                        if (hasMojibake(xml)) {
                            const recovered = tryRecoverMojibake(xml);
                            if (recovered) {
                                log.info("Recovered mojibake in scraper XML");
                                xml = recovered;
                            }
                        }

                        xml = xml.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/g, "");

                        const trimmedXml = xml.trim().toLowerCase();
                        const isHtml = trimmedXml.startsWith("<!doctype html") ||
                            trimmedXml.startsWith("<html") ||
                            trimmedXml.startsWith("<doctype html");
                        if (isHtml) {
                            throw new Error("HTML_RESPONSE");
                        }
                        return xml;
                    }
                }
            } finally {
                clearTimeout(timeout);
            }
        } catch (scraperErr: any) {
            log.error(`Playwright Scraper fallback also failed: ${scraperErr.message || scraperErr}`);
            if (scraperErr.message === "HTML_RESPONSE") {
                throw scraperErr;
            }
        }
        throw error;
    }
}

// ── fetchTwitterTweets ───────────────────────────────────────────────────────

async function fetchTwitterTweets(username: string, bearerToken: string | null): Promise<any[]> {
    const log = logger.child({ requestId: "twitter-fetch", keyword: username });
    log.info(`Fetching tweets for @${username} (Bearer token available: ${!!bearerToken})`);

    // 1. Try official API v2 if bearer token is available
    if (bearerToken) {
        try {
            const lookupUrl = `https://api.twitter.com/2/users/by/username/${username}`;
            const lookupController = new AbortController();
            const lookupTimeout = setTimeout(() => lookupController.abort(), SCRAPER_TIMEOUT);

            try {
                const lookupRes = await fetch(lookupUrl, {
                    headers: { "Authorization": `Bearer ${bearerToken}` },
                    signal: lookupController.signal
                });

                if (lookupRes.ok) {
                    const lookupData = await lookupRes.json() as any;
                    if (lookupData?.data?.id) {
                        const userId = lookupData.data.id;

                        const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=20&tweet.fields=created_at,author_id,entities,public_metrics&expansions=author_id`;
                        const tweetsController = new AbortController();
                        const tweetsTimeout = setTimeout(() => tweetsController.abort(), SCRAPER_TIMEOUT);

                        try {
                            const tweetsRes = await fetch(tweetsUrl, {
                                headers: { "Authorization": `Bearer ${bearerToken}` },
                                signal: tweetsController.signal
                            });

                            if (tweetsRes.ok) {
                                const tweetsData = await tweetsRes.json() as any;
                                if (tweetsData?.data) {
                                    log.info(`Fetched ${tweetsData.data.length} tweets via API v2 for @${username}`);
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
                                log.warn(`Twitter API tweets endpoint failed: ${tweetsRes.status}`);
                            }
                        } finally {
                            clearTimeout(tweetsTimeout);
                        }
                    }
                } else {
                    log.warn(`Twitter API user lookup failed: ${lookupRes.status}`);
                }
            } finally {
                clearTimeout(lookupTimeout);
            }
        } catch (err: any) {
            log.error(`Twitter API failed, falling back to syndication... ${err.message || err}`);
        }
    }

    // 2. Fallback to syndication.twitter.com/srv/timeline-profile/screen-name=...
    try {
        const syndicationUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name=${username}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

        try {
            const res = await fetch(syndicationUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5,ar;q=0.3",
                },
                signal: controller.signal
            });

            if (res.ok) {
                const html = await res.text();
                const cheerio = await import("cheerio");
                const $ = cheerio.load(html);
                const nextDataJson = $("#__NEXT_DATA__").html();
                if (nextDataJson) {
                    const parsed = JSON.parse(nextDataJson);
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
                        log.info(`Scraped ${tweets.length} tweets from syndication`);
                        return tweets;
                    }
                }
            }
        } finally {
            clearTimeout(timeout);
        }
        log.warn("Syndication scraping returned no tweets");
    } catch (err: any) {
        log.error(`Twitter syndication fallback failed: ${err.message || err}`);
    }

    return [];
}

// ── PRESS RELEASE WIRE FEEDS CONFIGURATION ───────────────────────────────────

const PR_WIRE_FEEDS = [
    { name: "Sky News Arabia (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia", country: "AE", lang: "ar" },
    { name: "Al Arabiya (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AlArabiya", country: "SA", lang: "ar" },
    { name: "Al Jazeera Mubasher (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=AJMubasher", country: "QA", lang: "ar" },
    { name: "Al Kass TV (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=alkass_tv", country: "QA", lang: "ar" },
    { name: "Dubai PR Network", url: "https://www.dubaiprnetwork.com/rss_feed.asp", country: "AE", lang: "en" },
    { name: "Arab News", url: "https://www.arabnews.com/rss.xml", country: "SA", lang: "en" },
    { name: "Newswire_com", url: "https://www.newswire.com/newsroom/rss/all", country: "US", lang: "en" },
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
    { name: "NPR", url: "http://www.npr.org/rss/rss.php?id=1004", country: "US", lang: "en" },
    { name: "Fox News", url: "http://feeds.foxnews.com/foxnews/latest", country: "US", lang: "en" },
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", country: "GB", lang: "en" },
    { name: "Yahoo News", url: "http://rss.news.yahoo.com/rss/world", country: "US", lang: "en" },
    { name: "LA Times", url: "http://www.latimes.com/world/rss2.0.xml", country: "US", lang: "en" },
    { name: "CS Monitor", url: "http://rss.csmonitor.com/feeds/usa", country: "US", lang: "en" },
    { name: "NBC News", url: "http://feeds.nbcnews.com/feeds/topstories", country: "US", lang: "en" },
    { name: "The Guardian", url: "http://www.theguardian.com/world/usa/rss", country: "GB", lang: "en" },
    { name: "ABC News", url: "http://feeds.abcnews.com/abcnews/usheadlines", country: "US", lang: "en" },
    { name: "Deadline", url: "http://deadline.com/feed/", country: "US", lang: "en" },
    { name: "Vulture", url: "http://feeds.feedburner.com/nymag/vulture", country: "US", lang: "en" },
    { name: "CNN", url: "http://rss.cnn.com/rss/cnn_showbiz.rss", country: "US", lang: "en" },
    { name: "Esquire", url: "http://www.esquire.com/blogs/culture/culture-rss", country: "US", lang: "en" },
    { name: "CBS News", url: "http://www.cbsnews.com/latest/rss/entertainment", country: "US", lang: "en" },
    { name: "TMZ", url: "http://www.tmz.com/rss.xml", country: "US", lang: "en" },
    { name: "BuzzFeed", url: "http://www.buzzfeed.com/tvandmovies.xml", country: "US", lang: "en" },
    { name: "Variety", url: "http://variety.com/feed/", country: "US", lang: "en" },
    { name: "Yahoo News", url: "http://news.yahoo.com/rss/entertainment", country: "US", lang: "en" },
    { name: "Huffington Post", url: "https://www.huffpost.com/dept/entertainment/feed", country: "US", lang: "en" },
];

export const fetchPressReleaseSources = action({
    args: {
        keyword: v.optional(v.string()),
        limit: v.optional(v.number()),
        dateFrom: v.optional(v.string()),
        dateTo: v.optional(v.string()),
        jobId: v.optional(v.id("press_release_sync_jobs")),
    },
    handler: async (ctx, args): Promise<{ success: boolean; totalSaved: number; totalErrors: number; feedResults: any[]; message: string }> => {
        const log = logger.child({ requestId: "press-release-sync", keyword: args.keyword });
        try {
            if (args.jobId) {
                await ctx.runMutation(api.pressReleaseJobs.startPressReleaseSyncJob, { jobId: args.jobId });
            }

            let completedSources = 0;
            const updateProgress = async (name: string, saved: number, total: number, error?: string, durationMs?: number) => {
                if (args.jobId) {
                    completedSources++;
                    await ctx.runMutation(api.pressReleaseJobs.updatePressReleaseSyncJobProgress, {
                        jobId: args.jobId,
                        completedSources,
                        totalSaved: saved,
                        totalErrors: error ? 1 : 0,
                        feedResult: {
                            feed: name,
                            name,
                            saved,
                            total,
                            error,
                            durationMs
                        }
                    });
                }
            };

            const identity = await ctx.auth.getUserIdentity();
            if (identity) {
                await requireAdmin(ctx.auth);
            }

            const fetchedKeyword = args.keyword?.trim() || "";

            // --- DIRECT URL SYNC FALLBACK OPTION ---
            if (fetchedKeyword && /^https?:\/\//i.test(fetchedKeyword)) {
                log.info(`Direct URL Sync detected for: ${fetchedKeyword}`);

                let extracted = await extractWithDirectScraper(fetchedKeyword, true);

                if (!extracted) {
                    const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
                    if (worldnewsKey) {
                        extracted = await extractWithWorldNews(fetchedKeyword, worldnewsKey, true);
                    }
                }

                if (!extracted) {
                    extracted = await extractWithPlaywrightScraper(fetchedKeyword, true);
                }

                if (extracted) {
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
                        fetchedKeyword, // Passes URL as keyword which bypasses boolean filter
                        geminiKey,
                        ["Press Release"],
                        null,
                        null,
                        false,
                        "Press Release"
                    );

                    if (processed) {
                        if (args.jobId) {
                            await updateProgress(matchedPublisher, 1, 1, undefined, undefined);
                            await ctx.runMutation(api.pressReleaseJobs.completePressReleaseSyncJob, { jobId: args.jobId, status: "success" });
                        }
                        return {
                            success: true,
                            totalSaved: 1,
                            totalErrors: 0,
                            feedResults: [{ name: matchedPublisher, status: "Success", saved: 1, total: 1 }],
                            message: `Direct URL Sync complete. Ingested article from ${matchedPublisher}.`
                        };
                    }
                }

                if (args.jobId) {
                    await updateProgress(new URL(fetchedKeyword).hostname, 0, 0, "Extraction Failed", undefined);
                    await ctx.runMutation(api.pressReleaseJobs.completePressReleaseSyncJob, { jobId: args.jobId, status: "error", error: "Extraction Failed" });
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

            const ParserClass = (await import("rss-parser")).default;
            const parser = new ParserClass({
                timeout: 10000,
                customFields: {
                    item: [
                        ["source", "source"],
                        ["media:content", "mediaContent"],
                        ["content:encoded", "contentEncoded"]
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
                log.info(`Keyword search detected. Launching Google News domain-restricted search...`);

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

                const uniqueDomains = Array.from(new Set(domains));

                const batchSize = 10;
                const batches: string[][] = [];
                for (let i = 0; i < uniqueDomains.length; i += batchSize) {
                    batches.push(uniqueDomains.slice(i, i + batchSize));
                }

                log.info(`Domain-restricted search: Batched ${uniqueDomains.length} domains into ${batches.length} chunks`);

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

                            log.info(`[PR Engine] Batch ${batchIndex + 1}/${batches.length} fetching...`);

                            const xml = await fetchRobustRss(rssUrl);
                            const feedData = await parser.parseString(xml);
                            log.info(`[PR Engine] Batch ${batchIndex + 1} found ${feedData.items?.length || 0} indexed articles`);

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
                            if (args.jobId) {
                                await updateProgress(`Search Engine (Batch ${batchIndex + 1})`, savedCount, rawItems.length, undefined, undefined);
                            }
                        } catch (err: any) {
                            log.error(`[PR Engine] Batch ${batchIndex + 1} failed: ${err.message || err}`);
                            if (args.jobId) {
                                await updateProgress(`Search Engine (Batch ${batchIndex + 1})`, 0, 0, err.message || "Failed", undefined);
                            }
                        }
                    })
                );

                // 1.6 Parallel Serper Web Search
                if (serperKey) {
                    log.info(`Serper Key found. Running parallel Serper searches...`);
                    await Promise.all(
                        batches.map(async (batch, batchIndex) => {
                            try {
                                const siteRestrictions = batch.map(d => `site:${d}`).join(" OR ");
                                const cleanQuery = buildApiQuery(fetchedKeyword);
                                const finalQuery = `"${cleanQuery}" (${siteRestrictions})`;

                                log.info(`[Serper Search] Batch ${batchIndex + 1}/${batches.length} fetching...`);

                                const controller = new AbortController();
                                const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

                                try {
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
                                        }),
                                        signal: controller.signal
                                    });

                                    if (serperRes.ok) {
                                        const serperData = await serperRes.json();
                                        const organic = serperData.organic || [];
                                        log.info(`[Serper Search] Batch ${batchIndex + 1} found ${organic.length} indexed articles`);

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
                                        if (args.jobId) {
                                            await updateProgress(`Serper Web Search (Batch ${batchIndex + 1})`, savedCount, organic.length, undefined, undefined);
                                        }
                                    }
                                } finally {
                                    clearTimeout(timeout);
                                }
                            } catch (err: any) {
                                log.error(`[Serper Search] Batch ${batchIndex + 1} failed: ${err.message || err}`);
                                if (args.jobId) {
                                    await updateProgress(`Serper Web Search (Batch ${batchIndex + 1})`, 0, 0, err.message || "Failed", undefined);
                                }
                            }
                        })
                    );
                }

                // 1.7 Parallel Bing Standard Web Search
                if (bingKey) {
                    log.info(`Bing Key found. Running standard Bing Search in parallel for batches...`);
                    await Promise.all(
                        batches.map(async (batch, batchIndex) => {
                            try {
                                const siteRestrictions = batch.map(d => `site:${d}`).join(" OR ");
                                const cleanQuery = buildApiQuery(fetchedKeyword);
                                const finalQuery = `"${cleanQuery}" (${siteRestrictions})`;

                                log.info(`[Bing Search] Batch ${batchIndex + 1}/${batches.length} fetching...`);

                                const controller = new AbortController();
                                const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

                                try {
                                    const bingRes = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(finalQuery)}&count=15&mkt=ar-AE&safeSearch=Moderate`, {
                                        headers: {
                                            "Ocp-Apim-Subscription-Key": bingKey
                                        },
                                        signal: controller.signal
                                    });

                                    if (bingRes.ok) {
                                        const bingData = await bingRes.json();
                                        const webPages = bingData.webPages?.value || [];
                                        log.info(`[Bing Search] Batch ${batchIndex + 1} found ${webPages.length} indexed articles`);

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
                                        if (args.jobId) {
                                            await updateProgress(`Bing Web Search (Batch ${batchIndex + 1})`, savedCount, webPages.length, undefined, undefined);
                                        }
                                    }
                                } finally {
                                    clearTimeout(timeout);
                                }
                            } catch (err: any) {
                                log.error(`[Bing Search] Batch ${batchIndex + 1} failed: ${err.message || err}`);
                                if (args.jobId) {
                                    await updateProgress(`Bing Web Search (Batch ${batchIndex + 1})`, 0, 0, err.message || "Failed", undefined);
                                }
                            }
                        })
                    );
                }
            }

            // Parallel RSS Ingestion with concurrency control (chunk size of 5)
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
                                    const formattedDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

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
                            if (args.jobId) {
                                await updateProgress(feed.name, savedCount, items.length, undefined, undefined);
                            }
                        } catch (err: any) {
                            const message = err.message || String(err);
                            log.error(`Feed Failed: ${feed.name}`, message);
                            let errorLabel = "Failed";
                            if (message.includes("HTML_RESPONSE")) errorLabel = "Private Site (HTML)";
                            else if (message.includes("HTTP_403")) errorLabel = "Access Denied (403)";
                            else if (message.includes("HTTP_404")) errorLabel = "Not Found (404)";
                            else if (message.includes("HTTP_429")) errorLabel = "Rate Limited (429)";
                            else if (message.includes("HTTP_4")) errorLabel = `Client Error (${message.match(/HTTP_(\d+)/)?.[1] || "4xx"})`;
                            else if (message.includes("HTTP_5")) errorLabel = `Server Error (${message.match(/HTTP_(\d+)/)?.[1] || "5xx"})`;
                            else if (message.includes("HTTP_400")) errorLabel = "Bad Request (400)";
                            else if (message.includes("timeout") || message.includes("Timeout")) errorLabel = "Timeout";
                            else if (message.includes("parse") || message.includes("XML") || message.includes("Invalid")) errorLabel = "XML Parse Error";
                            else if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) errorLabel = "DNS/Connection Error";

                            feedResults.push({ name: feed.name, status: "Failed", error: errorLabel, saved: 0 });
                            totalErrors++;
                            if (args.jobId) {
                                await updateProgress(feed.name, 0, 0, errorLabel, undefined);
                            }
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
                    if (args.jobId) {
                        await updateProgress("NewsAPI Historical", histSaved, historical.length, undefined, undefined);
                    }
                } catch (e: any) {
                    log.warn(`Historical Search Failed: ${e.message || e}`);
                    if (args.jobId) {
                        await updateProgress("NewsAPI Historical", 0, 0, e.message || "Failed", undefined);
                    }
                }
            }

            if (args.jobId) {
                await ctx.runMutation(api.pressReleaseJobs.completePressReleaseSyncJob, {
                    jobId: args.jobId,
                    status: "success",
                });
            }

            return {
                success: true,
                totalSaved,
                totalErrors,
                feedResults,
                message: `Sync complete. ${totalSaved} articles ingested.`
            };
        } catch (globalError: any) {
            if (args.jobId) {
                await ctx.runMutation(api.pressReleaseJobs.completePressReleaseSyncJob, {
                    jobId: args.jobId,
                    status: "error",
                    error: globalError.message || String(globalError),
                });
            }
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

export const testAction = action({ args: {}, handler: async () => { return "ok"; } });

export const testCheerio = action({ args: {}, handler: async () => { return "ok"; } });

export const testRssParser = action({ args: {}, handler: async () => { return "ok"; } });

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
    const log = logger.child({ requestId: "execute-rss-sync", articleId: args.feedUrl });
    try {
        const url = args.feedUrl;
        const publisher = args.publisher;
        const country = args.country || "UAE";
        const lang = args.lang || "ar";
        const limit = args.limit ?? 10;

        const ParserClass = (await import("rss-parser")).default;
        const parser = new ParserClass({
            timeout: 10000,
            customFields: {
                item: [
                    ["source", "source"],
                    ["media:content", "mediaContent"],
                    ["content:encoded", "contentEncoded"]
                ]
            }
        });

        log.info(`On-demand sync for publisher: ${publisher}, URL: ${url}`);

        const xml = await fetchRobustRss(url);
        const feedData = await parser.parseString(xml);
        const rawItems = feedData.items.slice(0, limit);

        let savedCount = 0;

        for (const item of rawItems) {
            if (!item.link || !item.title) continue;
            const isSeen = await checkAndSetSeen(item.link, item.title);
            if (isSeen) continue;

            const pubDate = item.pubDate ? new Date(item.pubDate) : null;
            const d = pubDate && !isNaN(pubDate.getTime()) ? pubDate : new Date();
            const formattedDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

            const snippet = item.contentSnippet || item.content || item.title || "";
            const isArabic = /[\u0600-\u06FF]/.test(item.title + snippet);
            const language = isArabic ? "AR" : (lang === "ar" ? "AR" : "EN");

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

    } catch (err: any) {
        log.error(`executeRssSync Failed: ${err.message || err}`);
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

    const parsed = Date.parse(cleanStr);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString();
    }

    const numMatch = cleanStr.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
    if (numMatch) {
        const value = parseInt(numMatch[1], 10);
        const unit = numMatch[2];

        switch (unit) {
            case "second":
                now.setSeconds(now.getSeconds() - value);
                break;
            case "minute":
                now.setMinutes(now.getMinutes() - value);
                break;
            case "hour":
                now.setHours(now.getHours() - value);
                break;
            case "day":
                now.setDate(now.getDate() - value);
                break;
            case "week":
                now.setDate(now.getDate() - value * 7);
                break;
            case "month":
                now.setMonth(now.getMonth() - value);
                break;
            case "year":
                now.setFullYear(now.getFullYear() - value);
                break;
        }
        return now.toISOString();
    }

    const arNumMatch = cleanStr.match(/(?:قبل|منذ)\s+([\d\u0660-\u0669]+)\s+(ثانية|دقيقة|ساعة|يوم|أسبوع|شهر|سنة|سنين|أيام|ساعات|دقائق)/);
    if (arNumMatch) {
        let valueStr = arNumMatch[1];
        valueStr = valueStr.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632));
        const value = parseInt(valueStr, 10);
        const unit = arNumMatch[2];

        if (unit.startsWith("ثاني")) now.setSeconds(now.getSeconds() - value);
        else if (unit.startsWith("دقيق")) now.setMinutes(now.getMinutes() - value);
        else if (unit.startsWith("ساع")) now.setHours(now.getHours() - value);
        else if (unit.startsWith("يوم") || unit === "أيام") now.setDate(now.getDate() - value);
        else if (unit.startsWith("أسبوع")) now.setDate(now.getDate() - value * 7);
        else if (unit.startsWith("شهر")) now.setMonth(now.getMonth() - value);
        else if (unit.startsWith("سن") || unit === "سنين") now.setFullYear(now.getFullYear() - value);

        return now.toISOString();
    }

    if (cleanStr.includes("يومين")) {
        now.setDate(now.getDate() - 2);
        return now.toISOString();
    }
    if (cleanStr.includes("ساعتين")) {
        now.setHours(now.getHours() - 2);
        return now.toISOString();
    }
    if (cleanStr.includes("أسبوعين")) {
        now.setDate(now.getDate() - 14);
        return now.toISOString();
    }
    if (cleanStr.includes("شهرين")) {
        now.setMonth(now.getMonth() - 2);
        return now.toISOString();
    }

    if (cleanStr.includes("ساعة")) {
        now.setHours(now.getHours() - 1);
        return now.toISOString();
    }
    if (cleanStr.includes("يوم")) {
        now.setDate(now.getDate() - 1);
        return now.toISOString();
    }
    if (cleanStr.includes("أسبوع")) {
        now.setDate(now.getDate() - 7);
        return now.toISOString();
    }
    if (cleanStr.includes("شهر")) {
        now.setMonth(now.getMonth() - 1);
        return now.toISOString();
    }
    if (cleanStr.includes("سنة")) {
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
    }

    return now.toISOString();
}

// ── DISTRIBUTED SCRAPER QUEUE PROCESSOR ──────────────────────────────────────

export const processQueueBatch = internalAction({
    args: {},
    handler: async (ctx) => {
        const log = logger.child({ requestId: "queue-processor" });
        const acquired = await ctx.runMutation(api.monitoring.acquireQueueLock);
        if (!acquired) {
            log.info("🔒 Another queue processor is active. Exiting.");
            return;
        }

        try {
            const batch = await ctx.runMutation(api.monitoring.getPendingQueueBatch, { limit: 5 });
            if (batch.length === 0) {
                log.info("📭 No pending queue items. Releasing lock.");
                await ctx.runMutation(api.monitoring.releaseQueueLock);
                return;
            }

            log.info(`Processing batch of ${batch.length} items.`);

            for (const item of batch) {
                await ctx.runMutation(api.monitoring.updateQueueItemStatus, {
                    id: item._id,
                    status: "processing"
                });

                try {
                    await ctx.runAction(internal.monitoringAction.analyzeArticleBackground, {
                        articleId: item.articleId
                    });

                    await ctx.runMutation(api.monitoring.updateQueueItemStatus, {
                        id: item._id,
                        status: "completed"
                    });
                } catch (err: any) {
                    log.error(`Error processing queue item ${item._id}: ${err.message || err}`);

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

            await ctx.runMutation(api.monitoring.releaseQueueLock);

            // Schedule next loop in 5 seconds
            await ctx.scheduler.runAfter(5000, internal.monitoringAction.processQueueBatch, {});
        } catch (error: any) {
            log.error("🔥 Critical processor failure", error);
            await ctx.runMutation(api.monitoring.releaseQueueLock);
        }
    }
});
