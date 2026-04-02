import { query } from "./_generated/server";

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
