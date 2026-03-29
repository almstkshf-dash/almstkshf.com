import { query } from "./_generated/server";

/**
 * Exposes whether the currently authenticated user has admin privileges.
 * Used by frontend components to conditionally show admin-only UI.
 * Safe to call from any authenticated or unauthenticated context — returns false if no session.
 */
export const checkIsAdmin = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        // Check ADMIN_USER_IDS env var
        try {
            const adminIds = (process.env.ADMIN_USER_IDS || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            if (adminIds.includes(identity.subject)) return true;
        } catch {
            // process.env may not be available in all query contexts
        }

        // Check role claim in JWT
        const role = (
            (identity as any)?.role ||
            (identity as any)?.orgRole ||
            (identity as any)?.publicMetadata?.role ||
            (identity as any)?.claims?.role ||
            ""
        ).toString().toLowerCase();

        return ["admin", "owner", "superadmin"].includes(role);
    },
});
