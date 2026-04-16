import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { api, internal } from "../_generated/api";

/**
 * Resolves an API key with 3-tier precedence:
 * 1. User's own key (userSettings)
 * 2. System global key (app_settings)
 * 3. Environment Variable (process.env)
 *
 * @param ctx Context (Action, Mutation, or Query)
 * @param envVarName The process.env variable name.
 * @param settingsField The key field name in `apiKeys` of userSettings / app_settings.
 * @returns The resolved key or null.
 */
export async function resolveApiKey(
    ctx: ActionCtx | MutationCtx | QueryCtx,
    envVarName: string,
    settingsField?: string
): Promise<string | null> {
    const envKey = process.env[envVarName] || null;
    
    try {
        const identity = await ctx.auth.getUserIdentity();
        let appSettings: any = null;
        let userSettings: any = null;

        if ("db" in ctx) {
            // Context has direct DB access (Mutation or Query) — bypasses authorization checks in public queries
            const dbRef = (ctx as QueryCtx | MutationCtx).db;
            appSettings = await dbRef
                .query("app_settings")
                .filter((q) => q.eq(q.field("type"), "global"))
                .first();
            
            if (identity) {
                userSettings = await dbRef
                    .query("userSettings")
                    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
                    .unique();
            }
        } else {
            // Action context — must use runQuery
            // Using internal query to bypass redaction for server-side key resolution
            appSettings = await ctx.runQuery(internal.settings.getSystemSettings, {});
            if (identity) {
                userSettings = await ctx.runQuery(api.userSettings.get, { userId: identity.subject });
            }
        }

        // 1. User Settings (BYOK) - Highest precedence
        if (settingsField && userSettings?.apiKeys?.[settingsField]) {
            const key = userSettings.apiKeys[settingsField];
            if (key && key !== "None") return key;
        }
        
        // Legacy fallback for gemini specifically if not in apiKeys object
        if (settingsField === "gemini" && userSettings?.geminiApiKey && userSettings.geminiApiKey !== "None") {
            return userSettings.geminiApiKey;
        }

        // 2. Global App Settings (System Keys)
        if (settingsField && appSettings?.apiKeys?.[settingsField]) {
            const key = appSettings.apiKeys[settingsField];
            if (key && key !== "None") return key;
        }

    } catch (error) {
        console.warn(`[resolveApiKey] Error fetching DB keys for ${envVarName}, falling back to process.env`, error);
    }

    // 3. Environment Variable - Final fallback
    return envKey;
}

