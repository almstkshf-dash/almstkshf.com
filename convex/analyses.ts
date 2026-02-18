import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveAnalysis = mutation({
    args: {
        inputText: v.string(),
        sentiment: v.string(),
        score: v.number(),
        risk: v.string(),
        riskScore: v.optional(v.number()),
        tone: v.string(),
        emotions: v.optional(v.any()),
        topics: v.optional(v.array(v.string())),
        entities: v.optional(v.array(v.string())),
        recommendation: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("free_analyses", {
            ...args,
            timestamp: Date.now(),
        });
        return { id, ...args };
    },
});
