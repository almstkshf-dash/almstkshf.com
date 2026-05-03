import { query } from "./_generated/server";

export const dump = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("app_settings").collect();
    }
});
