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
        let updatedCount = 0;

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

            // Clean up items if needed
            const cleanedItems = [];
            let itemsChanged = false;
            if (Array.isArray(col.items)) {
                for (const item of col.items) {
                    if (item && typeof item === "object") {
                        if (item.addedAt === undefined) {
                            cleanedItems.push({
                                ...item,
                                addedAt: col._creationTime,
                            });
                            itemsChanged = true;
                        } else {
                            cleanedItems.push(item);
                        }
                    } else {
                        cleanedItems.push(item);
                    }
                }
            }

            if (itemsChanged) {
                patchData.items = cleanedItems;
                needsPatch = true;
            }

            if (needsPatch) {
                await ctx.db.patch(col._id, patchData);
                updatedCount++;
            }
        }

        return { totalCollections: collections.length, updatedCollections: updatedCount };
    }
});

export const debugListCollections = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("collections").collect();
    }
});
