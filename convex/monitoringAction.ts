"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
// @ts-ignore
import NewsAPI from 'newsapi';
import { requireAdmin } from "./utils/auth";
import { resolveApiKey } from "./utils/keys";
import { parseBooleanKeyword, matchesBooleanFilter, buildApiQuery } from "./utils/booleanFilter";
import { checkAndSetSeen } from "./utils/dedup";
import { sendResendEmail } from "./utils/email";

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
    keyword: string,
    intendedCategories: string[] = []
): Promise<{
    sentiment: "Positive" | "Neutral" | "Negative";
    summary: string;
    sourceType: "Online News" | "Blog" | "Press Release" | "Social Media" | "Print";
    reach_estimate: number;
    tone?: string;
    risk?: "Low" | "Medium" | "High";
    hashtags?: string[];
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
  "risk": "Low" | "Medium" | "High",
  "hashtags": ["list", "of", "relevant", "hashtags"]
}`;

    const models = ["gemini-3.1-flash-preview", "gemini-3.0-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

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
                hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
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
// GEMINI RELEVANCY GATE — Returns 0-100 relevancy score
// Articles scoring below RELEVANCY_THRESHOLD are discarded before DB write.
// ═══════════════════════════════════════════════════════════════════
const RELEVANCY_THRESHOLD = 85;

async function callGeminiRelevancyScore(
    apiKey: string,
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

    // Use the fastest available model for this quick gate
    const models = ["gemini-3.0-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const model of models) {
        try {
            const response = await fetch(
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

            if (!response.ok) {
                if (response.status === 404) continue;
                console.warn(`Relevancy check ${model} returned ${response.status}`);
                return 100; // Fail-open: allow article if API errors
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return 100;

            const parsed = JSON.parse(text.trim());
            const score = typeof parsed.relevancy_score === "number" ? parsed.relevancy_score : 100;
            console.log(`🎯 Relevancy [${score}/100] — ${parsed.reason || ""} — "${title.substring(0, 50)}"`);
            return score;
        } catch (e) {
            console.warn(`Relevancy model ${model} failed:`, e);
            continue;
        }
    }

    return 100; // Fail-open if all models fail
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
        sourceTypes: v.optional(v.string()), // comma-separated: "Online News,Press Release"
        dateFrom: v.optional(v.string()),  // DD/MM/YYYY
        dateTo: v.optional(v.string()),    // DD/MM/YYYY
    },
    handler: async (ctx, args): Promise<{ success: boolean; count?: number; skipped?: number; feeds?: number; error?: string }> => {
        try {
            // Check if user is admin
            await requireAdmin(ctx.auth);
            const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            if (!apiKey) {
                const ident = await ctx.auth.getUserIdentity();
                const sourceInfo = ident ? (ident.subject ? "Source: User Settings or System Config" : "Source: System Config") : "Source: Env Context (No Identity)";
                throw new Error(`Gemini API key is missing or invalid. [${sourceInfo}]. Please ensure you have configured your GEMINI_API_KEY in App Settings or Environment Variables.`);
            }

            const newsdataKey = await resolveApiKey(ctx, "NEWSDATA_API_KEY", "newsdata");
            const newsapiKey = await resolveApiKey(ctx, "NEWSAPI_API_KEY", "newsapi");
            const gnewsKey = await resolveApiKey(ctx, "GNEWS_API_KEY", "gnews");
            const worldnewsKey = await resolveApiKey(ctx, "WORLDNEWS_API_KEY", "worldnews");
            const twitterBearer = await resolveApiKey(ctx, "X_BEARER_TOKEN", "twitterBearer");
            const twitterApiKey = await resolveApiKey(ctx, "X_API_KEY", "twitterConsumerKey");
            const twitterApiSecret = await resolveApiKey(ctx, "X_API_SECRET", "twitterConsumerSecret");
            const twitterAccessToken = await resolveApiKey(ctx, "X_ACCESS_TOKEN", "twitterAccessToken");
            const twitterTokenSecret = await resolveApiKey(ctx, "X_ACCESS_TOKEN_SECRET", "twitterAccessTokenSecret");

            const providers = [
                { name: 'NewsData.io', key: newsdataKey },
                { name: 'NewsAPI.org', key: newsapiKey },
                { name: 'GNews.io', key: gnewsKey },
                { name: 'WorldNews API', key: worldnewsKey }
            ];

            if (providers.filter(p => p.key).length === 0) {
                return { success: false, error: "Missing news provider API keys. Please configure at least one in Settings." };
            }

            const parser = new Parser();

            // Parse multi-values
            const countryList = args.countries.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
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
            // We use buildApiQuery to get a "clean" version for the API, 
            // but for RSS we might want to keep the enriched logic.
            const cleanQuery = buildApiQuery(args.keyword);
            let enrichedQuery = cleanQuery.includes(' ') ? `"${cleanQuery}"` : cleanQuery;

            // Source Type targeting
            const stList = args.sourceTypes ? args.sourceTypes.split(',').map(s => s.trim()) : [];
            if (stList.includes('Press Release')) {
                enrichedQuery += ' (site:prnewswire.com OR site:businesswire.com OR site:zawya.com OR site:wam.ae)';
            } else if (stList.includes('Social Media')) {
                enrichedQuery += ' (site:twitter.com OR site:reddit.com OR site:linkedin.com)';
            }

            // Enhance query with date operators for exact matching
            if (dateFromObj) {
                const after = dateFromObj.toISOString().split('T')[0];
                enrichedQuery += ` after:${after}`;
            }
            if (dateToObj) {
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
            let totalSkipped = 0;

            for (const combo of rssCombos) {
                console.log(`📡 Fetching Google RSS [${combo.lang}/${combo.country}]: ${combo.url}`);
                try {
                    const feed = await parser.parseURL(combo.url);
                    const items = feed.items.slice(0, 10);
                    for (const item of items) {
                        const success = await processArticle(ctx, item, combo.country, combo.lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, true);
                        if (success) totalSuccess++; else totalSkipped++;
                    }
                } catch (e) { console.error(`❌ RSS fail: ${combo.url}`, e); }
            }

            // 2. FETCH FROM NEWSDATA.IO (Full API)
            if (newsdataKey) {
                console.log(`📡 Fetching NewsData.io for: ${cleanQuery}`);
                try {
                    const ndUrl = `https://newsdata.io/api/1/latest?apikey=${newsdataKey}&q=${encodeURIComponent(cleanQuery)}&language=${languageList.join(',')}&country=${countryList.join(',')}`;
                    const ndRes = await fetch(ndUrl);
                    if (ndRes.ok) {
                        const ndData = await ndRes.json();
                        if (ndData.status === "success" && ndData.results) {
                            console.log(`📰 Found ${ndData.results.length} items from NewsData.io`);
                            for (const item of ndData.results) {
                                const success = await processArticle(ctx, {
                                    title: item.title,
                                    link: item.link,
                                    pubDate: item.pubDate,
                                    contentSnippet: `Source: ${item.source_id || 'Unknown'}. ${item.description || item.content || item.title}`,
                                    imageUrl: item.image_url
                                }, (item.country?.[0] || countryList[0]).toUpperCase(), item.language || languageList[0], args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                if (success) totalSuccess++; else totalSkipped++;
                            }
                        }
                    } else {
                        console.warn(`⚠️ NewsData.io API returned error: ${ndRes.status}`);
                    }
                } catch (e) { console.error(`❌ NewsData.io fail`, e); }
            }

            // 3. FETCH FROM NEWSAPI.ORG (v2/everything)
            if (newsapiKey) {
                console.log(`📡 Fetching NewsAPI for: ${args.keyword} (using newsapi library)`);
                try {
                    const naClient = new NewsAPI(newsapiKey);
                    const naDateFrom = dateFromObj ? dateFromObj.toISOString().split('T')[0] : undefined;
                    const naDateTo = dateToObj ? dateToObj.toISOString().split('T')[0] : undefined;

                    for (const lang of languageList) {
                        const response = await naClient.v2.everything({
                            q: cleanQuery,
                            language: lang as any,
                            from: naDateFrom,
                            to: naDateTo,
                            sortBy: 'publishedAt',
                            pageSize: 20
                        });

                        if (response.status === "ok" && response.articles) {
                            console.log(`📰 Found ${response.articles.length} items from NewsAPI library [${lang}]`);
                            for (const item of response.articles) {
                                const success = await processArticle(ctx, {
                                    title: item.title,
                                    link: item.url,
                                    pubDate: item.publishedAt,
                                    contentSnippet: `Source: ${item.source?.name || 'Unknown'}. ${item.description || item.content || item.title}`,
                                    imageUrl: item.urlToImage
                                }, (countryList[0] || "AE").toUpperCase(), lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                if (success) totalSuccess++; else totalSkipped++;
                            }
                        } else {
                            console.warn(`⚠️ NewsAPI library error for [${lang}]:`, response.message || "Unknown error");
                        }
                    }
                } catch (e) { console.error(`❌ NewsAPI library fail`, e); }
            }

            // 4. FETCH FROM GNEWS.IO
            if (gnewsKey) {
                console.log(`📡 Fetching GNews for: ${args.keyword}`);
                try {
                    const gDateFrom = dateFromObj ? dateFromObj.toISOString().split('.')[0] + 'Z' : "";
                    const gDateTo = dateToObj ? dateToObj.toISOString().split('.')[0] + 'Z' : "";

                    let gnewsHalt = false;
                    for (const lang of languageList) {
                        if (gnewsHalt) break;
                        for (const country of countryList) {
                            if (gnewsHalt) break;

                            // GNews specific: wrap phrase in quotes for exact sequence search if it contains spaces
                            let gQuery = cleanQuery.trim();
                            if (gQuery.includes(' ') && !gQuery.startsWith('"')) {
                                gQuery = `"${gQuery}"`;
                            }
                            // Limit to 200 chars per GNews docs
                            gQuery = gQuery.substring(0, 200);

                            let gUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(gQuery)}&lang=${lang}&country=${country}&max=20&apikey=${gnewsKey}&sortby=publishedAt&nullable=description,image`;
                            if (gDateFrom) gUrl += `&from=${gDateFrom}`;
                            if (gDateTo) gUrl += `&to=${gDateTo}`;

                            const gRes = await fetch(gUrl);
                            if (gRes.ok) {
                                const gData = await gRes.json();
                                if (gData.articles) {
                                    console.log(`📰 Found ${gData.articles.length} items from GNews [${lang}/${country}]`);
                                    for (const item of gData.articles) {
                                        const success = await processArticle(ctx, {
                                            title: item.title,
                                            link: item.url,
                                            pubDate: item.publishedAt,
                                            contentSnippet: `Source: ${item.source?.name || 'Unknown'}. ${item.description || item.content || item.title}`,
                                            imageUrl: item.image
                                        }, country.toUpperCase(), lang, args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                        if (success) totalSuccess++; else totalSkipped++;
                                    }
                                }
                            } else {
                                const status = gRes.status;
                                let errorMsg = `Status ${status}`;
                                try {
                                    const errData = await gRes.json();
                                    if (errData.errors) {
                                        errorMsg = Array.isArray(errData.errors) ? errData.errors[0] : (typeof errData.errors === 'object' ? JSON.stringify(errData.errors) : errData.errors);
                                    }
                                } catch (e) { /* ignore parse fail */ }

                                console.warn(`⚠️ GNews API Error [${status}]: ${errorMsg}`);

                                if (status === 401 || status === 403) {
                                    console.error("🚨 GNews Fatal: Unauthorized or Quota Exceeded. Halting GNews requests.");
                                    gnewsHalt = true;
                                } else if (status === 429) {
                                    console.warn("⏳ GNews Rate Limit: Throttling...");
                                    await new Promise(r => setTimeout(r, 1000));
                                }
                            }
                        }
                    }
                } catch (e) { console.error(`❌ GNews fail`, e); }
            }

            // 5. FETCH FROM WORLDNEWSAPI.COM
            if (worldnewsKey) {
                console.log(`📡 Fetching WorldNews for: ${args.keyword}`);
                try {
                    // World News API parameters: text (max 100), language, source-country, earliest-publish-date
                    const wnDateFrom = dateFromObj ? dateFromObj.toISOString().replace('T', ' ').split('.')[0] : "";

                    let wnKeyword = cleanQuery.trim();
                    if (wnKeyword.includes(' ') && !wnKeyword.startsWith('"')) {
                        wnKeyword = `"${wnKeyword}"`;
                    }
                    // Truncate to 100 chars per docs
                    wnKeyword = wnKeyword.substring(0, 100);

                    // API supports multiple languages as comma-separated
                    const langs = languageList.join(',');

                    // Note: Documentation shows source-country (singular). If multiple, we take the first or loop. 
                    // We'll use the first one for the primary query to stay within quota/speed.
                    const country = (countryList[0] || 'ae').toLowerCase();

                    let wnUrl = `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(wnKeyword)}&language=${langs}&source-country=${country}&number=20&sort=publish-time&sort-direction=DESC`;
                    if (wnDateFrom) wnUrl += `&earliest-publish-date=${wnDateFrom}`;

                    const wnRes = await fetch(wnUrl, {
                        headers: { 'x-api-key': worldnewsKey }
                    });

                    // Log quota if headers present
                    const quotaUsed = wnRes.headers.get('x-api-quota-used');
                    const quotaLeft = wnRes.headers.get('x-api-quota-left');
                    if (quotaUsed || quotaLeft) {
                        console.log(`📊 WorldNews Quota: Used ${quotaUsed}, Left ${quotaLeft}`);
                    }

                    if (wnRes.ok) {
                        const wnData = await wnRes.json();
                        if (wnData.news) {
                            console.log(`📰 Found ${wnData.news.length} items from WorldNewsAPI (Available: ${wnData.available})`);
                            if (wnData.available >= 100000) {
                                console.warn("⚠️ WorldNewsAPI: 100,000+ results found. Consider making the query more specific.");
                            }
                            for (const item of wnData.news) {
                                // Format authors array to string
                                const authorStr = Array.isArray(item.authors) ? item.authors.join(', ') : (item.author || 'Unknown');

                                const success = await processArticle(ctx, {
                                    title: item.title,
                                    link: item.url,
                                    pubDate: item.publish_date, // Format is YYYY-MM-DD HH:MM:SS
                                    contentSnippet: `Source: ${authorStr}. ${item.text || item.title}`,
                                    imageUrl: item.image
                                }, (item.source_country || country).toUpperCase(), item.language || languageList[0], args.keyword, apiKey, stList, dateFromObj, dateToObj, false);
                                if (success) totalSuccess++; else totalSkipped++;
                            }
                        }
                    } else {
                        console.warn(`⚠️ WorldNews API returned error: ${wnRes.status}`);
                    }
                } catch (e) { console.error(`❌ WorldNews fail`, e); }
            }

            // 6. FETCH FROM TWITTER (X) if configured
            if (twitterBearer) {
                console.log(`📡 Fetching Twitter for: ${cleanQuery}`);
                try {
                    const txQuery = encodeURIComponent(cleanQuery);
                    const txUrl = `https://api.twitter.com/2/tweets/search/recent?query=${txQuery}&max_results=20&tweet.fields=created_at,author_id,entities,public_metrics&expansions=author_id`;

                    const txRes = await fetch(txUrl, {
                        headers: { 'Authorization': `Bearer ${twitterBearer}` }
                    });

                    if (txRes.ok) {
                        const txData = await txRes.json();
                        if (txData.data) {
                            console.log(`📰 Found ${txData.data.length} tweets from X`);
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
                                if (success) totalSuccess++; else totalSkipped++;
                            }
                        }
                    } else {
                        const txErr = await txRes.text();
                        console.warn(`⚠️ Twitter API error: ${txRes.status}`, txErr);
                    }
                } catch (e) { console.error(`❌ Twitter fail`, e); }
            }

            console.log(`📊 Done: ${totalSuccess} saved, ${totalSkipped} skipped`);
            return { success: true, count: totalSuccess, skipped: totalSkipped, feeds: rssCombos.length + 1 + languageList.length + (languageList.length * countryList.length) + 1 + 1 };
        } catch (globalError: any) {
            console.error("🏁 CRITICAL: Global fetchNews failure", globalError);
            return { success: false, error: "Unable to process news monitoring." };
        }
    },
});

// ═══════════════════════════════════════════════════════════════════
// THE EXTRACTOR — Direct URL to Article Extraction
// ═══════════════════════════════════════════════════════════════════
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
            console.error("❌ Extract error:", error);
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
        console.error("❌ WorldNews Extract fail", e);
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
    geminiKey: string,
    stList: string[],
    dateFrom: Date | null,
    dateTo: Date | null,
    shouldResolve: boolean,
    forceSourceType?: string
) {
    if (!item.link || !item.title) return false;

    try {
        // ── GATE 1: Boolean Pre-Filter ─────────────────────────────────────
        // Evaluates mandatory (+), excluded (-), and phrase terms BEFORE any
        // API call. Zero cost — pure string matching.
        const boolExpr = parseBooleanKeyword(keyword);
        const snippet = item.contentSnippet || item.content || item.title;
        if (!matchesBooleanFilter(boolExpr, item.title, snippet)) {
            console.log(`⚡ Boolean reject: "${item.title.substring(0, 60)}..."`);
            return false;
        }

        // ── GATE 2: Date Filter ────────────────────────────────────────────
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (pubDate) {
            if (dateFrom && pubDate < dateFrom) return false;
            if (dateTo && pubDate > dateTo) return false;
        }

        // ── GATE 3: Redis Deduplication (24-hour hash cache) ──────────────
        // Prevents the same article from multiple providers (NewsData, GNews,
        // RSS) being stored twice. Uses SHA-256(url+title) with 24h TTL.
        const isDuplicate = await checkAndSetSeen(item.link, item.title);
        if (isDuplicate) {
            return false; // Log already printed inside checkAndSetSeen
        }

        // ── GATE 4: Gemini Relevancy Score (≥70 required) ─────────────────
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
            console.log(`⚠️ Low relevancy (${relevancyScore}/100) — discarded: "${item.title.substring(0, 60)}"`);
            return false;
        }

        // ── RESOLVE: Spider — Resolve URL if needed (RSS redirects) ───────
        let resolvedUrl = item.link;
        let imageUrl = item.imageUrl;
        let sourceName = item.source || item.creator;

        if (shouldResolve) {
            console.log(`🕷️ Resolving: ${item.title.substring(0, 50)}...`);
            const resolved = await resolveUrl(item.link);
            if (resolved) {
                resolvedUrl = resolved.finalUrl;
                imageUrl = resolved.imageUrl || imageUrl;
                sourceName = resolved.source || sourceName;
            }
        }

        // ── ANALYSE: Full Gemini Sentiment Analysis ────────────────────────
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
        });

        const ident = await ctx.auth.getUserIdentity();
        const userId = ident?.subject;

        if (userId && (aiData.risk === "High" || aiData.sentiment === "Negative")) {
            try {
                await ctx.runMutation(api.monitoring.createNotification, {
                    userId,
                    title: "Alert: High Risk / Negative Mention",
                    message: `Found mention for "${keyword}": ${item.title.substring(0, 60)}...`,
                    type: "alert"
                });

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

            } catch (err) {
                console.error("Failed to create notification or send email:", err);
            }
        }

        return true;
    } catch (e) {
        console.error(`Error processing item: ${item.title}`, e);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESS RELEASE WIRE INGESTION
// Directly pulls from major global and Arab PR wire RSS feeds.
// Bypasses news aggregator APIs — content is first-party from wire services.
// ═══════════════════════════════════════════════════════════════════════════════

// PR wire RSS sources — mix of global and MENA-focused feeds
const PR_WIRE_FEEDS: Array<{
    name: string;
    url: string;
    country: string;
    lang: "en" | "ar";
}> = [
        // Global wires (English)
        { name: "PR Newswire", url: "https://www.prnewswire.com/rss/news-releases-list.rss", country: "US", lang: "en" },
        { name: "Business Wire", url: "https://feeds.businesswire.com/rss/home?rss=G1&rssid=rss_bw_all", country: "US", lang: "en" },
        { name: "GlobeNewswire MENA", url: "https://www.globenewswire.com/RssFeed/subjectcode/15/Middle+East+and+Africa", country: "AE", lang: "en" },
        // MENA / Arab wires
        { name: "Zawya PR", url: "https://www.zawya.com/en/rss/press-releases", country: "AE", lang: "en" },
        { name: "WAM (UAE EN)", url: "https://www.wam.ae/en/rss", country: "AE", lang: "en" },
        { name: "WAM (UAE AR)", url: "https://www.wam.ae/ar/rss", country: "AE", lang: "ar" },
        { name: "SPA (Saudi)", url: "https://www.spa.gov.sa/rss/feedAll.rss", country: "SA", lang: "ar" },
        { name: "MENA FN", url: "https://menafn.com/rss/1", country: "AE", lang: "en" },
        { name: "Gulf News PR", url: "https://gulfnews.com/rss/press-releases", country: "AE", lang: "en" },
    ];

export const fetchPressReleaseSources = action({
    args: {
        keyword: v.optional(v.string()),
        limit: v.optional(v.number()),      // max candidates per feed (user-controlled)
        dateFrom: v.optional(v.string()),   // ISO date string e.g. "2025-01-01"
        dateTo: v.optional(v.string()),     // ISO date string e.g. "2025-12-31"
    },
    handler: async (ctx, args): Promise<{ success: boolean; totalSaved: number; totalErrors: number; feedResults: Record<string, unknown>[]; message: string }> => {
        await requireAdmin(ctx.auth);

        // Get Gemini API key from hierarchical settings
        const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

        const fetchedKeyword = args.keyword?.trim() || "";
        // Support Boolean logic in Press Release filtering
        const booleanExpr = parseBooleanKeyword(fetchedKeyword);
        const keyword = fetchedKeyword || "Press Release";
        const itemLimit = args.limit ?? 30;   // per-feed cap — user controlled

        // Date range (optional) — ISO strings from the UI date picker
        const dateFromObj = args.dateFrom ? new Date(args.dateFrom) : null;
        const dateToObj = args.dateTo ? new Date(args.dateTo + "T23:59:59Z") : null;
        const parser = new Parser({ timeout: 10000 });

        let totalSaved = 0;
        let totalErrors = 0;
        const feedResults: Record<string, unknown>[] = [];

        // Fetch all feeds in parallel (each feed error is isolated)
        await Promise.all(
            PR_WIRE_FEEDS.map(async (feed) => {
                let savedCount = 0;
                try {
                    const feedData = await parser.parseURL(feed.url);

                    // Each feed pulls up to itemLimit candidates, then we filter by keyword
                    const candidates = feedData.items.slice(0, itemLimit);

                    // ── Keyword filter (Boolean logic) ────────────────────────────────
                    const afterKeyword = fetchedKeyword
                        ? candidates.filter((item) => {
                            const title = item.title ?? "";
                            const snippet = item.contentSnippet || item.content || "";
                            return matchesBooleanFilter(booleanExpr, title, snippet);
                        })
                        : candidates;

                    // ── Date range filter ────────────────────────────────────────────
                    const items = (dateFromObj || dateToObj)
                        ? afterKeyword.filter((item) => {
                            if (!item.pubDate) return true;
                            const pub = new Date(item.pubDate);
                            if (isNaN(pub.getTime())) return true;
                            if (dateFromObj && pub < dateFromObj) return false;
                            if (dateToObj && pub > dateToObj) return false;
                            return true;
                        })
                        : afterKeyword;

                    for (const item of items) {
                        if (!item.link || !item.title) continue;

                        try {
                            // ── GATE 1: Redis Deduplication ──────────────────────────────────
                            // Prevent identical PRs from overlapping feeds or multiple runs
                            const isSeen = await checkAndSetSeen(item.link, item.title);
                            if (isSeen) {
                                console.log(`🗑️ PR Dedup skip: ${item.title.substring(0, 50)}...`);
                                continue;
                            }

                            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
                            const dd = pubDate.getDate().toString().padStart(2, "0");
                            const mm = (pubDate.getMonth() + 1).toString().padStart(2, "0");
                            const formattedDate = `${dd}/${mm}/${pubDate.getFullYear()}`;

                            const snippet = item.contentSnippet || item.content || item.title;
                            const isArabic = /[\u0600-\u06FF]/.test(item.title + snippet);

                            // ── GATE 2: Relevancy Scoring ────────────────────────────────────
                            // Even for PR wires, ensure it's high quality if keyword logic is complex
                            if (geminiKey && fetchedKeyword) {
                                try {
                                    const relScore = await callGeminiRelevancyScore(geminiKey, item.title, snippet, fetchedKeyword);
                                    if (relScore < 70) {
                                        console.log(`⚠️ PR Low relevancy (${relScore}): ${item.title.substring(0, 50)}...`);
                                        continue;
                                    }
                                } catch (e) { console.error("Relevancy gate error (PR):", e); }
                            }

                            let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
                            let summary = snippet.slice(0, 300);
                            let reach = 75000;

                            if (geminiKey) {
                                try {
                                    const aiData = await callGeminiForAnalysis(
                                        geminiKey, item.title, snippet, keyword, ["Press Release"]
                                    );
                                    sentiment = aiData.sentiment;
                                    summary = aiData.summary || summary;
                                    reach = aiData.reach_estimate || reach;
                                } catch (_) { /* use defaults if AI fails */ }
                            }

                            const ave = Math.round(reach * 0.02 * 5);

                            await ctx.runMutation(api.monitoring.saveArticle, {
                                keyword,
                                url: item.link,
                                publishedDate: formattedDate,
                                title: item.title,
                                content: summary,
                                language: (isArabic || feed.lang === "ar") ? "AR" : "EN",
                                sentiment,
                                sourceType: "Press Release",
                                source: feed.name,
                                sourceCountry: feed.country,
                                reach,
                                ave,
                                depth: "standard",
                                ingestMethod: "rss",
                            });

                            savedCount++;
                            totalSaved++;
                        } catch (_) {
                            totalErrors++;
                        }
                    }

                    feedResults.push({ feed: feed.name, saved: savedCount, total: items.length });
                } catch (feedErr: any) {
                    feedResults.push({ feed: feed.name, error: feedErr?.message || "fetch failed" });
                    totalErrors++;
                }
            })
        );

        return {
            success: true,
            totalSaved,
            totalErrors,
            feedResults,
            message: `Ingested ${totalSaved} press releases from ${PR_WIRE_FEEDS.length} wire sources`,
        };
    },
});

