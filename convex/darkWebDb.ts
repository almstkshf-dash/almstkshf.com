import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// ─── Save a new Dark Web result ───────────────────────────────────────
export const insert = mutation({
    args: {
        query: v.string(),
        source_type: v.union(v.literal("ahmia"), v.literal("diffbot"), v.literal("zenrows")),
        url: v.string(),
        title: v.string(),
        snippet: v.string(),
        risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        country_origin: v.optional(v.string()),
        summary: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");
        return await ctx.db.insert("darkweb_results", {
            ...args,
            user_id: identity.subject,
            discovered_at: Date.now(),
        });
    },
});

// ─── Fetch recent Dark Web results for the current user ───────────────
export const getByUserId = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db.query("darkweb_results")
            .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
            .order("desc")
            .take(args.limit ?? 50);
    },
});

// ─── Fetch Dark Web results by risk level ──────────────────────────────
export const getByRiskLevel = query({
    args: { risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Uses compound index — avoids .filter() per Convex query guidelines
        return await ctx.db.query("darkweb_results")
            .withIndex("by_user_id_and_risk_level", (q) =>
                q.eq("user_id", identity.subject).eq("risk_level", args.risk_level)
            )
            .order("desc")
            .take(50);
    },
});

// ─── Delete a single Dark Web result ──────────────────────────────────
export const deleteById = mutation({
    args: { id: v.id("darkweb_results") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const result = await ctx.db.get(args.id);
        if (!result) throw new ConvexError("Result not found");
        if (result.user_id !== identity.subject) throw new ConvexError("Not authorized");

        await ctx.db.delete(args.id);
    },
});
