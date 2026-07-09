/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Id } from "../_generated/dataModel";

/**
 * Resolves full data for a collection item at read time by fetching from its
 * normalized source table, or falling back to metadata stored directly on the item.
 * 
 * Returns null if the item has been deleted from its source table.
 */
export async function resolveCollectionItem(
    ctx: any,
    itemType: string,
    itemId: string,
    fallbackTitle?: string,
    fallbackSourceId?: string,
    fallbackData?: any
) {
    let title = fallbackTitle || "Unknown";
    let sourceId = fallbackSourceId;
    let data = fallbackData;

    try {
        if (itemType === "media_monitoring") {
            const doc = await ctx.db.get(itemId as Id<"media_monitoring_articles">);
            if (doc) {
                title = doc.title;
                sourceId = doc.sourceCountry;
                data = doc;
            } else {
                return null; // Skip deleted items
            }
        } else if (itemType === "watchlist") {
            const doc = await ctx.db.get(itemId as Id<"local_terrorist_list">);
            if (doc) {
                title = doc.nameArabic || doc.nameLatin || "Unknown";
                data = doc;
            } else {
                return null;
            }
        } else if (itemType === "deep_web") {
            const doc = await ctx.db.get(itemId as Id<"darkweb_results">);
            if (doc) {
                title = doc.title;
                sourceId = doc.source_type;
                data = doc;
            } else {
                return null;
            }
        } else if (itemType === "osint") {
            if (itemId && !itemId.startsWith("bulk_")) {
                const doc = await ctx.db.get(itemId as Id<"osint_results">);
                if (doc) {
                    title = `OSINT: ${doc.type} lookup for ${doc.query}`;
                    data = doc.result;
                } else {
                    return null;
                }
            }
        }
    } catch (error) {
        console.error(`Error resolving collection item: type=${itemType}, id=${itemId}`, error);
    }

    return {
        id: itemId,
        type: itemType,
        title,
        sourceId,
        data,
    };
}
