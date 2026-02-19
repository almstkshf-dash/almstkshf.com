import { query } from "./_generated/server";
import { v } from "convex/values";


export const getCrisisPlans = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("crisis_plans").collect();
    },
});
