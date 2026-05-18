/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getKeywordCollections = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const collections = await ctx.db
            .query("keyword_collections")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        return collections.sort((a, b) => b.updatedAt - a.updatedAt);
    },
});

export const createKeywordCollection = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collectionId = await ctx.db.insert("keyword_collections", {
            userId: identity.subject,
            name: args.name,
            keywords: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return collectionId;
    },
});

export const deleteKeywordCollection = mutation({
    args: {
        id: v.id("keyword_collections"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.id);
        if (!collection || collection.userId !== identity.subject) {
            throw new Error("Collection not found or unauthorized");
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const addKeyword = mutation({
    args: {
        collectionId: v.id("keyword_collections"),
        keyword: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new Error("Collection not found or unauthorized");
        }

        const newKeyword = args.keyword.trim();
        if (!newKeyword) {
            throw new Error("Keyword cannot be empty");
        }

        if (collection.keywords.includes(newKeyword)) {
            return collection;
        }

        const updatedKeywords = [...collection.keywords, newKeyword];
        await ctx.db.patch(args.collectionId, {
            keywords: updatedKeywords,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(args.collectionId);
    },
});

export const deleteKeyword = mutation({
    args: {
        collectionId: v.id("keyword_collections"),
        keyword: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const collection = await ctx.db.get(args.collectionId);
        if (!collection || collection.userId !== identity.subject) {
            throw new Error("Collection not found or unauthorized");
        }

        const updatedKeywords = collection.keywords.filter(
            (kw) => kw !== args.keyword
        );

        await ctx.db.patch(args.collectionId, {
            keywords: updatedKeywords,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(args.collectionId);
    },
});
