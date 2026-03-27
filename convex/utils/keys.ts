import { QueryCtx, ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";

type KeyContext = QueryCtx | ActionCtx;

/**
 * Resolves an API key using the hierarchy:
 * User Setting (by_userId) → Global app_settings → process.env
 */
export async function resolveApiKey(
  ctx: KeyContext,
  envVarName: string,
  settingsField?: string
): Promise<string | null> {
  // 1. User Settings (only if authenticated)
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      // In Actions, we must use runQuery. In Queries, we could use db (but runQuery is safer for a shared utility).
      const userSettings = await (ctx as ActionCtx).runQuery(
        api.userSettings.get,
        { userId: identity.subject }
      );
      if (settingsField && userSettings?.apiKeys && typeof userSettings.apiKeys === 'object') {
        // @ts-ignore
        const key = userSettings.apiKeys[settingsField];
        if (key) return String(key).trim();
      }
    }
  } catch (e) {
    // identity unavailable or query failed - proceed to fallback
  }

  // 2. Global app_settings
  try {
    const appSettings = await (ctx as ActionCtx).runQuery(
      api.settings.getSettings,
      {}
    );
    if (settingsField && appSettings?.apiKeys && typeof appSettings.apiKeys === 'object') {
      // @ts-ignore
      const key = appSettings.apiKeys[settingsField];
      if (key) return String(key).trim();
    }
  } catch (e) {
    // settings unavailable - proceed to env
  }

  // 3. Environment variable
  return process.env[envVarName]?.trim() ?? null;
}

