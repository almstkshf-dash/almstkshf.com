import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const submissionId = await ctx.db.insert("contact_submissions", {
            ...args,
            timestamp: Date.now(),
        });
        return submissionId;
    },
});
