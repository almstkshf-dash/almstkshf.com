import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCollections = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collections = await ctx.db.query("collections")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        return collections.sort((a, b) => b.updatedAt - a.updatedAt);
    },
});

export const getCollection = query({
    args: { id: v.id("collections") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.id);
        if (!collection || collection.userId !== identity.subject) {
            return null;
        }

        return collection;
    },
});

export const createCollection = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collectionId = await ctx.db.insert("collections", {
            userId: identity.subject,
            name: args.name,
            description: args.description,
            items: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return collectionId;
    },
});

export const deleteCollection = mutation({
    args: {
        id: v.id("collections")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.id);
        if (!collection || collection.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    }
});

export const addToCollection = mutation({
    args: {
        collectionId: v.id("collections"),
        item: v.object({
            id: v.string(),
            type: v.union(
                v.literal("media_monitoring"),
                v.literal("osint"),
                v.literal("ai_inspector"),
                v.literal("watchlist"),
                v.literal("deep_web"),
                v.literal("custom")
            ),
            title: v.string(),
            sourceId: v.optional(v.string()),
            data: v.any(),
        })
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        // Avoid exact duplicates
        if (collection.items.find(i => i.id === args.item.id)) {
            return collection._id;
        }

        const updatedItems = [...collection.items, { ...args.item, addedAt: Date.now() }];

        await ctx.db.patch(args.collectionId, {
            items: updatedItems,
            updatedAt: Date.now()
        });

        return collection._id;
    }
});

export const removeFromCollection = mutation({
    args: {
        collectionId: v.id("collections"),
        itemId: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        const updatedItems = collection.items.filter(i => i.id !== args.itemId);

        await ctx.db.patch(args.collectionId, {
            items: updatedItems,
            updatedAt: Date.now()
        });

        return collection._id;
    }
});
