/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { action, mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { requireAdmin } from "./utils/auth";
import { resolveApiKey } from "./utils/keys";



// Simple robots.txt checker (skip disallowed)
async function isAllowed(url: string): Promise<boolean> {
    try {
        const u = new URL(url);
        const robotsUrl = `${u.origin}/robots.txt`;
        const res = await fetch(robotsUrl);
        if (!res.ok) return true; // if missing, assume allowed
        const text = await res.text();
        const lines = text.split("\n").map(l => l.trim().toLowerCase());
        const disallow = lines.filter(l => l.startsWith("disallow:")).map(l => l.replace("disallow:", "").trim());
        return !disallow.some(path => u.pathname.startsWith(path));
    } catch {
        return true;
    }
}

export const getDeepRuns = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        // Using the defined index for better performance and explicit sorting
        const runs = await ctx.db.query("ingestion_runs_deep")
            .withIndex("by_started_at")
            .order("desc")
            .take(args.limit ?? 20);

        return runs;
    }
});

export const fetchDeepSources = action({
    args: {
        languages: v.string(), // comma separated, e.g., "en,ar"
        countries: v.optional(v.string()), // comma separated ISO
        sources: v.optional(v.string()), // enum list, unused for now
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<{ success: boolean; count?: number; error?: string }> => {
        // When called from the scheduler (cron), there is no user identity â€” that's safe by design.
        // When called directly by a user, we still require admin privileges.
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            await requireAdmin(ctx.auth);
        }
        const start = Date.now();
        const limit = args.limit ?? 10; // Lower default limit for deep scans
        let itemCount = 0;
        try {
            const newsapiKey = await resolveApiKey(ctx, "NEWSAPI_API_KEY", "newsapi");

            if (!newsapiKey) {
                throw new Error("Missing NewsAPI key. Configure in Settings.");
            }

            const languages = args.languages.split(",").map(l => l.trim()).filter(Boolean);
            const countries = args.countries ? args.countries.split(",").map(c => c.trim()) : [];

            for (const lang of languages) {
                // fallback country to first provided or none
                const country = countries[0];
                const url = new URL("https://newsapi.org/v2/top-headlines");
                url.searchParams.set("pageSize", String(limit));
                url.searchParams.set("language", lang);
                if (country) url.searchParams.set("country", country.toLowerCase());

                const res = await fetch(url.toString(), {
                    headers: { "X-Api-Key": newsapiKey }
                });
                if (!res.ok) {
                    throw new Error(`NewsAPI error ${res.status}`);
                }
                const data = await res.json();
                const articles = data?.articles || [];

                for (const art of articles) {
                    if (!art.url || !(await isAllowed(art.url))) continue;
                    const published = art.publishedAt ? new Date(art.publishedAt) : new Date();
                    const formattedDate = `${published.getDate().toString().padStart(2, "0")}/${(published.getMonth() + 1).toString().padStart(2, "0")}/${published.getFullYear()}`;
                    await ctx.runMutation(api.monitoring.saveArticle, {
                        keyword: "Deep Discovery",
                        url: art.url,
                        resolvedUrl: art.url,
                        publishedDate: formattedDate,
                        title: art.title || "Untitled",
                        content: art.description || art.content || art.title || "",
                        language: lang.toLowerCase() === "ar" ? "AR" : "EN",
                        sentiment: "Neutral",
                        sourceType: "Online News",
                        sourceCountry: country ? country.toUpperCase() : "US",
                        source: art.source?.name || "NewsAPI",
                        reach: 50000,
                        ave: Math.round(50000 * 0.005 * 5),
                        depth: "deep",
                        ingestMethod: "api",
                        imageUrl: art.urlToImage || undefined,
                        isManual: false,
                    });
                    itemCount++;
                }
            }

            // --- OSINT & Dark Web Enrichment for Active Keywords ---
            console.log("ðŸš€ [Deep Scan] Starting Unified Intelligence enrichment...");
            const settings = await ctx.runQuery(internal.osintDb.getGlobalSettingsInternal);
            const keywords = settings?.defaults?.standardKeywords || [];

            if (keywords.length > 0) {
                console.log(`ðŸ”  [Deep Scan] Enriching ${keywords.length} keywords via OSINT and Dark Web...`);
                for (const kw of keywords) {
                    // Trigger in background
                    ctx.runAction(api.osint.lookupNews, { query: kw }).catch(e => console.error(`[OSINT] ${kw} failed:`, e));
                    ctx.runAction(api.darkWeb.searchAhmia, { query: kw }).catch(e => console.error(`[DarkWeb] ${kw} failed:`, e));
                }
            }

            await ctx.runMutation(api.deepSources.saveIngestionRun, {
                startedAt: start,
                status: "success",
                source: "newsapi",
                itemCount,
            });

            const subjectId = identity?.subject || "system";
            await ctx.runMutation(api.monitoring.createNotification, {
                userId: subjectId,
                title: "Deep Scan Completed",
                message: `Background sweep finished. Discovered ${itemCount} new items.`,
                type: "system"
            });

            return { success: true, count: itemCount };
        } catch (e: any) {
            await ctx.runMutation(api.deepSources.saveIngestionRun, {
                startedAt: start,
                status: "error",
                source: "newsapi",
                itemCount,
                error: e?.message || "unknown",
            });
            return { success: false, error: e?.message || "Deep fetch failed" };
        }
    }
});



export const saveIngestionRun = mutation({
    args: {
        startedAt: v.number(),
        status: v.union(v.literal("success"), v.literal("error")),
        source: v.string(),
        itemCount: v.number(),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("ingestion_runs_deep", args);
    }
});

