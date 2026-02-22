import { action, mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";


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
    handler: async (ctx, args) => {
        await ctx.runQuery(api.utils.checkAdmin.isAdmin, {});
        const start = Date.now();
        const limit = args.limit ?? 20;
        let itemCount = 0;
        try {
            const settings = await ctx.runQuery(api.settings.getSettings);
            const newsapiKey = settings?.apiKeys?.newsapi?.trim() || process.env.NEWSAPI_API_KEY?.trim();

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
                        keyword: "Deep",
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

            await ctx.runMutation(api.deepSources.saveIngestionRun, {
                startedAt: start,
                status: "success",
                source: "newsapi",
                itemCount,
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

