/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v, ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { resolveCollectionItem } from "./utils/collectionItemResolver";

const MAX_DATA_SIZE_BYTES = 100 * 1024; // 100 KB limit for unnormalized payloads

function checkDataSizeLimit(data: any) {
    if (data !== undefined && data !== null) {
        const serialized = JSON.stringify(data);
        if (serialized.length > MAX_DATA_SIZE_BYTES) {
            throw new ConvexError(
                `Saved item payload exceeds safety limit of 100KB (size: ${(serialized.length / 1024).toFixed(1)}KB)`
            );
        }
    }
}

export const getCollections = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const collections = await ctx.db.query("collections")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        const results = [];
        for (const col of collections) {
            const rawItems = await ctx.db.query("collection_items")
                .withIndex("by_collectionId", (q) => q.eq("collectionId", col._id))
                .collect();

            const resolvedItems = [];
            for (const rawItem of rawItems) {
                const resolved = await resolveCollectionItem(
                    ctx,
                    rawItem.itemType,
                    rawItem.itemId,
                    rawItem.title,
                    rawItem.sourceId,
                    rawItem.data
                );
                if (resolved) {
                    resolvedItems.push({
                        ...resolved,
                        addedAt: rawItem.addedAt,
                        addedBy: rawItem.addedBy,
                        notes: rawItem.notes,
                    });
                }
            }

            results.push({
                ...col,
                items: resolvedItems.sort((a, b) => b.addedAt - a.addedAt),
            });
        }

        return results.sort((a, b) => {
            const timeA = a.updatedAt ?? a.createdAt ?? a._creationTime;
            const timeB = b.updatedAt ?? b.createdAt ?? b._creationTime;
            return timeB - timeA;
        });
    },
});

export const getCollection = query({
    args: { id: v.id("collections") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const collection = await ctx.db.get(args.id);
        if (!collection || collection.userId !== identity.subject) {
            return null;
        }

        const rawItems = await ctx.db.query("collection_items")
            .withIndex("by_collectionId", (q) => q.eq("collectionId", collection._id))
            .collect();

        const resolvedItems = [];
        for (const rawItem of rawItems) {
            const resolved = await resolveCollectionItem(
                ctx,
                rawItem.itemType,
                rawItem.itemId,
                rawItem.title,
                rawItem.sourceId,
                rawItem.data
            );
            if (resolved) {
                resolvedItems.push({
                    ...resolved,
                    addedAt: rawItem.addedAt,
                    addedBy: rawItem.addedBy,
                    notes: rawItem.notes,
                });
            }
        }

        return {
            ...collection,
            items: resolvedItems.sort((a, b) => b.addedAt - a.addedAt),
        };
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
            throw new ConvexError("Unauthenticated");
        }

        const collectionId = await ctx.db.insert("collections", {
            userId: identity.subject,
            name: args.name,
            description: args.description,
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
            throw new ConvexError("Unauthenticated");
        }

        const collection = await ctx.db.get(args.id);
        if (!collection || collection.userId !== identity.subject) {
            throw new ConvexError("Unauthorized");
        }

        // Clean up associated items
        const rawItems = await ctx.db.query("collection_items")
            .withIndex("by_collectionId", (q) => q.eq("collectionId", args.id))
            .collect();

        for (const item of rawItems) {
            await ctx.db.delete(item._id);
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
            title: v.optional(v.string()),
            sourceId: v.optional(v.string()),
            data: v.optional(v.any()),
        })
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new ConvexError("Unauthorized");
        }

        checkDataSizeLimit(args.item.data);

        // Duplicate check using specific unique compound index
        const existing = await ctx.db.query("collection_items")
            .withIndex("by_collectionId_itemId_itemType", (q) =>
                q.eq("collectionId", args.collectionId)
                 .eq("itemId", args.item.id)
                 .eq("itemType", args.item.type)
            )
            .first();

        if (existing) {
            return { collectionId: collection._id, isDuplicate: true };
        }

        await ctx.db.insert("collection_items", {
            collectionId: args.collectionId,
            itemId: args.item.id,
            itemType: args.item.type,
            title: args.item.title,
            sourceId: args.item.sourceId,
            data: args.item.data,
            addedAt: Date.now(),
            addedBy: identity.name || identity.email,
        });

        await ctx.db.patch(args.collectionId, {
            updatedAt: Date.now()
        });

        return { collectionId: collection._id, isDuplicate: false };
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
            throw new ConvexError("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new ConvexError("Unauthorized");
        }

        // Locate item across any type
        const existing = await ctx.db.query("collection_items")
            .withIndex("by_collectionId", (q) => q.eq("collectionId", args.collectionId))
            .filter((q) => q.eq(q.field("itemId"), args.itemId))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            await ctx.db.patch(args.collectionId, {
                updatedAt: Date.now()
            });
        }

        return collection._id;
    }
});

export const removeMultipleFromCollection = mutation({
    args: {
        collectionId: v.id("collections"),
        itemIds: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new ConvexError("Unauthorized");
        }

        let deletedCount = 0;
        const toRemove = new Set(args.itemIds);

        const rawItems = await ctx.db.query("collection_items")
            .withIndex("by_collectionId", (q) => q.eq("collectionId", args.collectionId))
            .collect();

        for (const item of rawItems) {
            if (toRemove.has(item.itemId)) {
                await ctx.db.delete(item._id);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            await ctx.db.patch(args.collectionId, {
                updatedAt: Date.now()
            });
        }

        return collection._id;
    }
});

export const addMultipleToCollection = mutation({
    args: {
        collectionId: v.id("collections"),
        items: v.array(
            v.object({
                id: v.string(),
                type: v.union(
                    v.literal("media_monitoring"),
                    v.literal("osint"),
                    v.literal("ai_inspector"),
                    v.literal("watchlist"),
                    v.literal("deep_web"),
                    v.literal("custom")
                ),
                title: v.optional(v.string()),
                sourceId: v.optional(v.string()),
                data: v.optional(v.any()),
            })
        )
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new ConvexError("Unauthorized");
        }

        let addedCount = 0;
        let duplicateCount = 0;

        for (const item of args.items) {
            checkDataSizeLimit(item.data);

            const existing = await ctx.db.query("collection_items")
                .withIndex("by_collectionId_itemId_itemType", (q) =>
                    q.eq("collectionId", args.collectionId)
                     .eq("itemId", item.id)
                     .eq("itemType", item.type)
                )
                .first();

            if (existing) {
                duplicateCount++;
            } else {
                await ctx.db.insert("collection_items", {
                    collectionId: args.collectionId,
                    itemId: item.id,
                    itemType: item.type,
                    title: item.title,
                    sourceId: item.sourceId,
                    data: item.data,
                    addedAt: Date.now(),
                    addedBy: identity.name || identity.email,
                });
                addedCount++;
            }
        }

        if (addedCount > 0) {
            await ctx.db.patch(args.collectionId, {
                updatedAt: Date.now()
            });
        }

        return { collectionId: collection._id, addedCount, duplicateCount };
    }
});

/**
 * One-shot migration: strips the legacy embedded `items` field from all
 * collections documents that still carry it (old schema stored items inline).
 * Run once via: npx convex run collections:migrateStripLegacyItems
 * Safe to re-run — documents already clean are left untouched.
 */
export const migrateStripLegacyItems = internalMutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("collections").collect();
        let patched = 0;
        for (const col of all) {
            if ((col as any).items !== undefined) {
                // Replace the document without the items field
                const { items: _dropped, ...rest } = col as any;
                await ctx.db.replace(col._id, rest);
                patched++;
            }
        }
        return { patched };
    },
});
