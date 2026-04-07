// No "use node" — mutations and queries run on the default Convex runtime.
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// ─── Save a new OSINT lookup result ──────────────────────────────────
export const saveOsintResult = mutation({
    args: {
        type: v.union(
            v.literal("email"),
            v.literal("domain"),
            v.literal("ip"),
            v.literal("username"),
            v.literal("phone"),
            v.literal("gdelt"),
            v.literal("news"),
            v.literal("corporate"),
            v.literal("location"),
            v.literal("wikipedia")
        ),
        query: v.string(),
        result: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        return await ctx.db.insert("osint_results", {
            ...args,
            userId: identity.subject,
            createdAt: Date.now(),
        });
    },
});

// ─── Fetch recent OSINT results for the current user ─────────────────
export const getOsintResults = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        return await ctx.db.query("osint_results")
            .withIndex("by_created_at")
            .order("desc")
            .take(args.limit ?? 50);
    },
});

// ─── Delete a single OSINT result ────────────────────────────────────
export const deleteOsintResult = mutation({
    args: { id: v.id("osint_results") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        await ctx.db.delete(args.id);
    },
});
