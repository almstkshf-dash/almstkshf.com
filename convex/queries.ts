import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMediaReports = query({
    args: { source: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let q = ctx.db.query("media_reports");
        // Note: In a real app, we would add filtering logic here.
        // Since args.source is optional and we indexed by source, we can optimize.
        if (args.source) {
            // @ts-ignore - Convex types might need generation first
            return await q.withIndex("by_source", (q) => q.eq("source", args.source)).collect();
        }
        return await q.collect();
    },
});

export const getCrisisPlans = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("crisis_plans").collect();
    },
});
