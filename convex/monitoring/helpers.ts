/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { parsePublishedDate } from "../utils/date";
import { Doc } from "../_generated/dataModel";

/**
 * Validates that a string is a valid web URL (http/https).
 * This prevents security vulnerabilities like javascript:, ftp:, or data: protocol schemes.
 */
export function isValidWebUrl(urlString?: string): boolean {
    if (!urlString) return true; // Optional URLs are allowed to be empty
    try {
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

/**
 * Builds the Convex query for media monitoring articles based on provided parameters,
 * selecting the optimal database index once and dynamically adding filters.
 */
export function queryArticlesWithIndex(
    ctx: QueryCtx | MutationCtx,
    args: { keyword?: string; sourceType?: string; sourceCountry?: string; depth?: string }
) {
    let q;
    
    // Choose index once
    if (args.keyword) {
        q = ctx.db.query("media_monitoring_articles")
            .withIndex("by_keyword_and_createdAt", (q) => q.eq("keyword", args.keyword!))
            .order("desc");
    } else if (args.sourceType && args.sourceType !== "All") {
        q = ctx.db.query("media_monitoring_articles")
            .withIndex("by_sourceType_and_createdAt", (q) => q.eq("sourceType", args.sourceType as any))
            .order("desc");
    } else if (args.sourceCountry && args.sourceCountry !== "All") {
        q = ctx.db.query("media_monitoring_articles")
            .withIndex("by_sourceCountry_and_createdAt", (q) => q.eq("sourceCountry", args.sourceCountry!))
            .order("desc");
    } else if (args.depth && args.depth !== "All") {
        q = ctx.db.query("media_monitoring_articles")
            .withIndex("by_depth_and_createdAt", (q) => q.eq("depth", args.depth as any))
            .order("desc");
    } else {
        q = ctx.db.query("media_monitoring_articles")
            .withIndex("by_createdAt")
            .order("desc");
    }

    // Determine which field was handled by the index to avoid redundant filters
    const chosenIndex = args.keyword ? "keyword" :
                        (args.sourceType && args.sourceType !== "All" ? "sourceType" :
                        (args.sourceCountry && args.sourceCountry !== "All" ? "sourceCountry" :
                        (args.depth && args.depth !== "All" ? "depth" : "none")));

    // Apply remaining filters cleanly
    if (args.sourceType && args.sourceType !== "All" && chosenIndex !== "sourceType") {
        q = q.filter((rule) => rule.eq(rule.field("sourceType"), args.sourceType));
    }
    if (args.sourceCountry && args.sourceCountry !== "All" && chosenIndex !== "sourceCountry") {
        q = q.filter((rule) => rule.eq(rule.field("sourceCountry"), args.sourceCountry));
    }
    if (args.depth && args.depth !== "All" && chosenIndex !== "depth") {
        q = q.filter((rule) => rule.eq(rule.field("depth"), args.depth));
    }

    return q;
}

/**
 * Returns a cached date timestamp map helper for O(1) timestamp retrieval during in-memory sorting.
 */
export function createTimestampCache() {
    const cache = new Map<string, number>();
    
    return (article: Doc<"media_monitoring_articles">) => {
        // Use stored DB timestamp if precomputed and available
        if (article.publishedTimestamp !== undefined) {
            return article.publishedTimestamp;
        }
        
        const dateStr = article.publishedDate;
        let ts = cache.get(dateStr);
        if (ts === undefined) {
            const parsed = parsePublishedDate(dateStr);
            ts = parsed ? parsed.getTime() : 0;
            cache.set(dateStr, ts);
        }
        return ts;
    };
}
