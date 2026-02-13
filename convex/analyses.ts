import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveAnalysis = mutation({
    args: {
        inputText: v.string(),
        sentiment: v.string(),
        score: v.number(),
        risk: v.string(),
        tone: v.string(),
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
