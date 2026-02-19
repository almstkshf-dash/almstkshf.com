import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCaseStudies = query({
    args: { category: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const q = ctx.db.query("case_studies");
        if (args.category) {
            return await q.filter((q) => q.eq(q.field("category"), args.category)).collect();
        }
        return await q.collect();
    },
});

export const addCaseStudy = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.string(),
        imageUrl: v.optional(v.string()),
        content: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("case_studies", args);
    },
});
