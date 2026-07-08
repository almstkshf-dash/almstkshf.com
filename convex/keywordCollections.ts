/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { v, ConvexError } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Central SaaS validation limit constants
const MAX_KEYWORD_LENGTH = 100;
const MAX_COLLECTION_NAME = 100;
const MAX_KEYWORDS = 500;

/**
 * Shared helper to verify collection existence and authorize ownership.
 * Throws structured ConvexError if unauthorized.
 */
async function getOwnedCollection(
    ctx: MutationCtx | QueryCtx,
    collectionId: Id<"keyword_collections">,
    userId: string
): Promise<Doc<"keyword_collections">> {
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.userId !== userId) {
        throw new ConvexError("CollectionNotFound: Collection not found or access denied.");
    }
    return collection;
}

/**
 * Trims and collapses multiple spaces, verifying length limits.
 */
function normalizeKeyword(keyword: string): string {
    const normalized = keyword.trim().replace(/\s+/g, " ");
    if (normalized.length === 0) {
        throw new ConvexError("InvalidKeyword: Keyword cannot be empty.");
    }
    if (normalized.length > MAX_KEYWORD_LENGTH) {
        throw new ConvexError(`InvalidKeyword: Keyword exceeds maximum length of ${MAX_KEYWORD_LENGTH} characters.`);
    }
    return normalized;
}

// 1. QUERY: Get all keyword collections, sorted by updatedAt descending
export const getKeywordCollections = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // Optimize: Use compound index by_userId_updatedAt to fetch pre-sorted results directly
        return await ctx.db
            .query("keyword_collections")
            .withIndex("by_userId_updatedAt", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();
    },
});

// 2. MUTATION: Create a new empty keyword collection
export const createKeywordCollection = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        const normalizedName = args.name.trim();
        if (!normalizedName) {
            throw new ConvexError("InvalidName: Collection name cannot be empty.");
        }
        if (normalizedName.length > MAX_COLLECTION_NAME) {
            throw new ConvexError(`InvalidName: Collection name exceeds maximum length of ${MAX_COLLECTION_NAME} characters.`);
        }

        // Ensure unique collection name per user (case-insensitive lookup)
        const existing = await ctx.db
            .query("keyword_collections")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();
        
        if (existing.some(c => c.name.toLowerCase() === normalizedName.toLowerCase())) {
            throw new ConvexError("DuplicateCollectionName: A keyword collection with this name already exists.");
        }

        const now = Date.now();
        const collectionId = await ctx.db.insert("keyword_collections", {
            userId: identity.subject,
            name: normalizedName,
            keywords: [],
            createdAt: now,
            updatedAt: now,
        });

        return collectionId;
    },
});

// 3. MUTATION: Delete a keyword collection
export const deleteKeywordCollection = mutation({
    args: {
        id: v.id("keyword_collections"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        await getOwnedCollection(ctx, args.id, identity.subject);

        await ctx.db.delete(args.id);
        return args.id;
    },
});

// 4. MUTATION: Add keyword to a collection
export const addKeyword = mutation({
    args: {
        collectionId: v.id("keyword_collections"),
        keyword: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        const collection = await getOwnedCollection(ctx, args.collectionId, identity.subject);
        const newKeyword = normalizeKeyword(args.keyword);

        // Prevent duplicate keywords in a case-insensitive manner
        const lowerKeyword = newKeyword.toLowerCase();
        const alreadyExists = collection.keywords.some(
            (kw) => kw.toLowerCase() === lowerKeyword
        );

        if (alreadyExists) {
            return collection;
        }

        // Enforce maximum keyword limits per collection
        if (collection.keywords.length >= MAX_KEYWORDS) {
            throw new ConvexError(`QuotaExceeded: Maximum keyword limit of ${MAX_KEYWORDS} reached for this collection.`);
        }

        const now = Date.now();
        const updatedKeywords: string[] = [...collection.keywords, newKeyword];
        await ctx.db.patch(args.collectionId, {
            keywords: updatedKeywords,
            updatedAt: now,
        });

        // Optimize return payload to avoid redundant read-after-write query
        return {
            ...collection,
            keywords: updatedKeywords,
            updatedAt: now,
        };
    },
});

// 5. MUTATION: Delete keyword from a collection
export const deleteKeyword = mutation({
    args: {
        collectionId: v.id("keyword_collections"),
        keyword: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthenticated");
        }

        const collection = await getOwnedCollection(ctx, args.collectionId, identity.subject);
        const keywordToRemove = args.keyword.trim().toLowerCase();

        const updatedKeywords = collection.keywords.filter(
            (kw) => kw.trim().toLowerCase() !== keywordToRemove
        );

        // If the keyword doesn't exist, return original collection structure
        if (updatedKeywords.length === collection.keywords.length) {
            return collection;
        }

        const now = Date.now();
        await ctx.db.patch(args.collectionId, {
            keywords: updatedKeywords,
            updatedAt: now,
        });

        // Optimize return payload to avoid redundant read-after-write query
        return {
            ...collection,
            keywords: updatedKeywords,
            updatedAt: now,
        };
    },
});
