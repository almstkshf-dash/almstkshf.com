import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Searches the local terrorist list using the search index.
 * Concatenates fields into searchField for unified Arabic/Latin search.
 */
export const search = query({
  args: {
    searchTerm: v.string(),
    type: v.optional(v.union(v.literal("individual"), v.literal("organization"), v.literal("entity"))),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm) {
      // Default view: Return recent entries
      if (args.type) {
        return await ctx.db
          .query("local_terrorist_list")
          .filter((q) => q.eq(q.field("type"), args.type))
          .take(50);
      }
      return await ctx.db.query("local_terrorist_list").take(50);
    }

    // Use built-in Search Index
    const searchQ = ctx.db
      .query("local_terrorist_list")
      .withSearchIndex("by_searchField", (q) => {
        const base = q.search("searchField", args.searchTerm);
        if (args.type) {
          return (base as any).eq("type", args.type);
        }
        return base;
      });

    return await searchQ.take(50);
  },
});

export const wipeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("local_terrorist_list").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
  },
});

export const addItems = mutation({
  args: {
    items: v.array(
      v.object({
        type: v.union(v.literal("individual"), v.literal("organization"), v.literal("entity")),
        category: v.string(),
        nameArabic: v.string(),
        nameLatin: v.string(),
        nationality: v.optional(v.string()),
        dob: v.optional(v.string()),
        pob: v.optional(v.string()),
        address: v.optional(v.string()),
        documentNumber: v.optional(v.string()),
        issuingAuthority: v.optional(v.string()),
        issueDate: v.optional(v.string()),
        expiryDate: v.optional(v.string()),
        otherInfo: v.optional(v.string()),
        reasons: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const searchField = [
        item.nameArabic,
        item.nameLatin,
        item.documentNumber || "",
        item.nationality || "",
        item.category,
        item.pob || "",
        item.dob || "",
        item.issueDate || "",
        item.expiryDate || "",
        item.reasons || "",
      ].filter(Boolean).join(" ").toLowerCase();

      await ctx.db.insert("local_terrorist_list", {
        ...item,
        searchField,
      });
    }
  },
});

/**
 * Get details for a specific entry.
 */
export const getEntry = query({
  args: { id: v.id("local_terrorist_list") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
