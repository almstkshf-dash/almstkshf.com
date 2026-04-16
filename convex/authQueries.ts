import { query } from "./_generated/server";
import { isAdmin } from "./utils/auth";

/**
 * Exposes whether the currently authenticated user has admin privileges.
 * Used by frontend components to conditionally show admin-only UI.
 * Safe to call from any authenticated or unauthenticated context — returns false if no session.
 */
export const checkIsAdmin = query({
    args: {},
    handler: async (ctx) => {
        return await isAdmin(ctx.auth);
    },
});
