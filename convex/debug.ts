import { mutation, query } from "./_generated/server";

export const debugListAllKeys = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("userSettings").collect();
        return all.map(s => ({
            userId: s.userId,
            isSubscribed: s.isSubscribed,
            geminiKeyMasked: s.geminiApiKey ? `${s.geminiApiKey.substring(0, 4)}...${s.geminiApiKey.substring(s.geminiApiKey.length - 4)}` : "missing"
        }));
    }
});

export const debugListArticlesCount = query({
    args: {},
    handler: async (ctx) => {
        const count = await ctx.db.query("media_monitoring_articles").collect();
        return { total: count.length };
    }
});

export const backfillCollections = mutation({
    args: {},
    handler: async (ctx) => {
        const collections = await ctx.db.query("collections").collect();
        let migratedItemsCount = 0;
        let updatedCollectionsCount = 0;

        for (const col of collections) {
            let needsPatch = false;
            const patchData: any = {};

            if (col.createdAt === undefined) {
                patchData.createdAt = col._creationTime;
                needsPatch = true;
            }

            if (col.updatedAt === undefined) {
                patchData.updatedAt = col.createdAt ?? col._creationTime;
                needsPatch = true;
            }

            const oldItems = (col as any).items;
            if (Array.isArray(oldItems) && oldItems.length > 0) {
                for (const item of oldItems) {
                    if (item && typeof item === "object" && item.id) {
                        const existing = await ctx.db.query("collection_items")
                            .withIndex("by_collectionId_itemId_itemType", (q) =>
                                q.eq("collectionId", col._id)
                                 .eq("itemId", item.id)
                                 .eq("itemType", item.type)
                            )
                            .first();

                        if (!existing) {
                            const isNormalized = item.type === "media_monitoring" || 
                                                 item.type === "watchlist" || 
                                                 item.type === "deep_web" || 
                                                 (item.type === "osint" && !item.id.startsWith("bulk_"));

                            await ctx.db.insert("collection_items", {
                                collectionId: col._id,
                                itemId: item.id,
                                itemType: item.type,
                                title: isNormalized ? undefined : item.title,
                                sourceId: isNormalized ? undefined : item.sourceId,
                                data: isNormalized ? undefined : item.data,
                                addedAt: item.addedAt ?? col._creationTime,
                                addedBy: "System Migration",
                            });
                            migratedItemsCount++;
                        }
                    }
                }

                // Remove the deprecated items array field
                patchData.items = undefined;
                needsPatch = true;
            }

            if (needsPatch) {
                await ctx.db.patch(col._id, patchData);
                updatedCollectionsCount++;
            }
        }

        return {
            totalCollections: collections.length,
            updatedCollections: updatedCollectionsCount,
            migratedItemsCount,
        };
    }
});

export const debugListCollections = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("collections").collect();
    }
});
