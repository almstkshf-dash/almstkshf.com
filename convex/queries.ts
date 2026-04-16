import { query } from "./_generated/server";
import { v } from "convex/values";


export const getCrisisPlans = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("crisis_plans").collect();
    },
});

export const getMediaReports = query({
    args: { source: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_monitoring_articles");

        if (args.source && args.source !== "All") {
            // @ts-expect-error
            q = q.filter((q) => q.eq(q.field("sourceType"), args.source));
        }

        const articles = await q.collect();

        const parseDate = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map((n) => parseInt(n, 10));
            return new Date(yyyy || 0, (mm || 1) - 1, dd || 1).getTime();
        };

        // Sort by publishedDate desc, then createdAt desc
        return articles.sort((a, b) => {
            const da = parseDate(a.publishedDate);
            const db = parseDate(b.publishedDate);
            if (db !== da) return db - da;
            return (b.createdAt || 0) - (a.createdAt || 0);
        }).map(a => ({
            ...a,
            status: "Published" // Added because UI expects this field (MediaMonitoringDashboard.tsx line 132)
        }));
    },
});
