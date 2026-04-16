"use node";

import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { resolveApiKey } from "./utils/keys";
import { api } from "./_generated/api";

// ─── Hybrid Heuristic Engine (Zero-Cost Fallback) ─────────────────────
function performHeuristicAnalysis(title: string, snippet: string) {
    const text = (title + " " + snippet).toLowerCase();

    // Risk Categories with Multilingual Support (EN/AR)
    const ruleBook = [
        {
            risk: "critical",
            keywords: [
                "database dump", "private key", "passport", "credit card", "root access", "ssn", "national id",
                "قاعدة بيانات", "مفتاح خاص", "جواز سفر", "بطاقة ائتمان", "اختراق كامل",
                "حشيش", "ماريجوانا", "كريستال", "كوك", "اكستر سي", "ترامادول", "لاريكا", "سي بي دي",
                "hashish", "weed", "cocauine", "extra c", "teramadol", "larica", "massage in dubai", "happy ending",
                "cristal mith", "escort girls", "harm", "harmfull", "CBD OIL"
            ]
        },
        {
            risk: "high",
            keywords: [
                "leak", "exploit", "zeroday", "vulnerability", "malware", "ransomware", "backdoor", "hack",
                "تسريب", "ثغرة", "برمجيات خبيثة", "فدية", "باب خلفي", "اختراق",
                "نصب", "خراب", "زفت", "فضيحة", "ورطة", "تعيس", "فاشل"
            ]
        },
        {
            risk: "medium",
            keywords: [
                "marketplace", "onion", "forum", "account", "login", "credentials", "tor",
                "سوق", "منتدى", "حساب", "دخول", "بيانات اعتماد"
            ]
        }
    ];

    let risk: "low" | "medium" | "high" | "critical" = "low";
    const tags: string[] = [];

    // 1. Identify Risk Level
    for (const rule of ruleBook) {
        if (rule.keywords.some(k => text.includes(k))) {
            risk = rule.risk as typeof risk;
            break;
        }
    }

    // 2. Pattern-Based Tagging (Sensitive Data Detection)
    if (text.match(/[a-zA-Z0-9-._]+@[a-z0-9-]+\.[a-z]{2,}/i)) tags.push("PII:Email");
    if (text.match(/[0-9a-f]{32,}/i)) tags.push("System:Hash");
    if (text.includes(".onion")) tags.push("Network:Tor");
    if (text.match(/\b(btc|eth|xmr)\b/i)) tags.push("Financial:Crypto");

    // 3. Smart Fallback Summary (Extract first 2 sentences)
    const sentences = snippet.split(/[.!?]/).filter(s => s.trim().length > 10);
    const summary = sentences.length > 0 ? (sentences[0].trim() + ". " + (sentences[1]?.trim() || "")).trim() : snippet;

    return { risk, summary, tags };
}

// ─── Gemini Risk Scoring Helper ───────────────────────────────────────
async function analyzeRiskWithGemini(title: string, text: string, geminiKey: string) {
    try {
        const prompt = `
Classify this Dark Web content risk for a media intelligence platform. Return exactly valid JSON: 
{ "risk": "low" | "medium" | "high" | "critical", "summary": "string", "tags": ["string"] }

Content Title: ${title}
Content Snippet: ${text}
`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" },
            }),
        });

        if (!response.ok) {
            console.warn("Gemini failing, falling back to heuristics...");
            return performHeuristicAnalysis(title, text);
        }

        const data = await response.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!outputText) return performHeuristicAnalysis(title, text);

        const parsed = JSON.parse(outputText);
        const validRisks = ["low", "medium", "high", "critical"];
        return {
            risk: validRisks.includes(parsed.risk) ? parsed.risk : "medium",
            summary: parsed.summary || "Summary generation missing",
            tags: parsed.tags || [],
        };
    } catch (e) {
        console.error("Gemini parse error, using heuristics:", e);
        return performHeuristicAnalysis(title, text);
    }
}

// ─── Search Ahmia (Onion Links) ───────────────────────────────────────
export const searchAhmia = action({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const q = encodeURIComponent(args.query);
        const url = `https://ahmia.fi/search/?q=${q}&output=json`;

        let results;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // Shorter 8s timeout for direct attempt

            const resp = await fetch(url, {
                headers: { "User-Agent": "Almstkshf-Bot/1.0" },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) throw new Error(`Ahmia API request failed with status ${resp.status}`);
            results = await resp.json();

        } catch (error) {
            console.warn("Direct Ahmia fetch failed, attempting ZenRows fallback...", error);
            const zenrowsKey = await resolveApiKey(ctx, "ZENROWS_API_KEY", "zenrows");

            if (!zenrowsKey) {
                console.error("No ZenRows key for fallback search.");
                throw new ConvexError("Dark Web search failed (Source unreachable). Please configure ZenRows for priority access.");
            }

            const zUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsKey}&url=${encodeURIComponent(url)}&js_render=true&premium_proxy=true`;
            try {
                const zResp = await fetch(zUrl);
                if (!zResp.ok) throw new Error(`ZenRows request failed status ${zResp.status}`);

                const zText = await zResp.text();
                // Find JSON in the response (in case it's wrapped or returned as string)
                const jsonMatch = zText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
                results = JSON.parse(jsonMatch ? jsonMatch[0] : zText);
            } catch (zError) {
                console.error("ZenRows Ahmia fallback failed:", zError);
                throw new ConvexError("Advanced Dark Web search remains unreachable (Ahmia/ZenRows failure).");
            }
        }

        try {
            // Ahmia sometimes returns an object with results in a property, or just an array
            const topResultsArray = Array.isArray(results) ? results : (results.results || []);
            const topResults = topResultsArray.slice(0, 20);

            // Resolve Gemini Key 
            const geminiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

            // Process results in parallel to avoid sequential fetch delays (Convex Action timeout)
            const processedResults = await Promise.all(
                topResults.map(async (item: any) => {
                    const title = item.title || "No Title";
                    const snippet = (item.description || item.snippet || "No Snippet").substring(0, 1000);

                    let analysis;
                    if (geminiKey) {
                        analysis = await analyzeRiskWithGemini(title, snippet, geminiKey);
                    } else {
                        analysis = performHeuristicAnalysis(title, snippet);
                    }
                    return { item, analysis, title, snippet };
                })
            );

            const savedResults = [];
            for (const { item, analysis, title, snippet } of processedResults) {
                // Insert into DB
                await ctx.runMutation(api.darkWebDb.insert, {
                    query: args.query,
                    source_type: "ahmia",
                    url: item.url || "#",
                    title,
                    snippet,
                    risk_level: analysis.risk as "low" | "medium" | "high" | "critical",
                    summary: analysis.summary,
                    tags: analysis.tags,
                });
                savedResults.push({ title, snippet, risk_level: analysis.risk, url: item.url });
            }

            return savedResults;
        } catch (error) {
            console.error("Ahmia Search Error:", error);
            throw new ConvexError("Failed to fetch from Ahmia");
        }
    },
});

// ─── Fetch Diffbot (Structured Scraping) ──────────────────────────────
export const fetchDiffbot = action({
    args: { url: v.string() },
    handler: async (ctx, args): Promise<{
        title: string;
        text: string;
        date?: string;
        author?: string;
        siteName?: string;
        language?: string;
        tags?: string[];
    }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const diffbotKey = await resolveApiKey(ctx, "DIFFBOT_API_KEY", "diffbot");

        if (!diffbotKey) {
            console.warn("Diffbot Key missing, attempting ZenRows fallback...");
            const zenrowsKey = await resolveApiKey(ctx, "ZENROWS_API_KEY", "zenrows");
            if (!zenrowsKey) {
                throw new ConvexError("No scraping service configured. Please set DIFFBOT_API_KEY or ZENROWS_API_KEY in settings.");
            }
            return await ctx.runAction(api.darkWeb.stealthFetch, { url: args.url });
        }

        const dbUrl = `https://api.diffbot.com/v3/article?url=${encodeURIComponent(args.url)}&token=${diffbotKey}`;

        try {
            const resp = await fetch(dbUrl);
            if (!resp.ok) {
                console.warn("Diffbot failed, attempting ZenRows fallback...");
                return await ctx.runAction(api.darkWeb.stealthFetch, { url: args.url });
            }

            const json = await resp.json();
            if (!json.objects || json.objects.length === 0) {
                return await ctx.runAction(api.darkWeb.stealthFetch, { url: args.url });
            }

            const article = json.objects[0];
            return {
                title: article.title || "Unknown",
                text: article.text || "",
                date: article.date,
                author: article.author,
                siteName: article.siteName,
                language: article.humanLanguage,
                tags: article.tags?.map((t: { label: string }) => t.label) || []
            };

        } catch (err) {
            console.error("Diffbot action error", err);
            // If it's a ConvexError from ZenRows, propagate it
            if (err instanceof ConvexError) throw err;

            // Try ZenRows fallback on generic fetch failure
            const zenrowsKey = await resolveApiKey(ctx, "ZENROWS_API_KEY", "zenrows");
            if (zenrowsKey) {
                return await ctx.runAction(api.darkWeb.stealthFetch, { url: args.url });
            }
            throw new ConvexError("Diffbot failed and no ZenRows fallback available.");
        }
    },
});

// ─── Stealth Fetch ZenRows (Anti-Bot Bypass) ──────────────────────────
export const stealthFetch = action({
    args: { url: v.string(), country: v.optional(v.string()) },
    handler: async (ctx, args): Promise<{ title: string, text: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const zenrowsKey = await resolveApiKey(ctx, "ZENROWS_API_KEY", "zenrows");
        if (!zenrowsKey) throw new ConvexError("ZenRows API key not configured. Please add it in System Settings.");

        let apiUrl = `https://api.zenrows.com/v1/?apikey=${zenrowsKey}&url=${encodeURIComponent(args.url)}&js_render=true&premium_proxy=true`;
        if (args.country) {
            apiUrl += `&proxy_country=${args.country}`;
        }

        try {
            const resp = await fetch(apiUrl);
            if (!resp.ok) throw new Error(`ZenRows returned ${resp.status}`);

            const html = await resp.text();

            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : "Unknown Page";

            const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            let text = "No body content found";
            if (bodyMatch) {
                text = bodyMatch[1].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 5000); // truncate
            }

            return { title, text };

        } catch (err) {
            console.error("ZenRows error", err);
            throw new ConvexError("Failed to fetch page securely");
        }
    },
});
