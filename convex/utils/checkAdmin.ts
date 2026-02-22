import { query } from "../_generated/server";
import { requireAdmin } from "./auth";

export const isAdmin = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx.auth);
        return true;
    },
});
