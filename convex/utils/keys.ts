import { QueryCtx, ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";

type KeyContext = QueryCtx | ActionCtx;

/**
 * Validates that an API key is not a placeholder or empty string.
 * Strictly checks Gemini keys for the standard 'AIzaSy' prefix.
 */
function isValidKey(key: any, isGemini: boolean = false): boolean {
  if (!key || typeof key !== 'string') return false;
  const k = key.trim();
  
  // Basic placeholders
  const lowerK = k.toLowerCase();
  if (["", "undefined", "null", "none", "placeholder"].includes(lowerK)) return false;

  // Strict check for Gemini: Must start with AIzaSy
  // This prevents project IDs (gen-...) or other junk from blocking the fallback logic.
  if (isGemini && !k.startsWith("AIzaSy")) {
    return false;
  }

  return true;
}

/**
 * Resolves an API key using the hierarchy:
 * 
 * FOR GEMINI:
 * 1. If Admin or Dev Mode -> System Key (App Settings > Env)
 * 2. If Subscribed or Trial Active -> System Key (App Settings > Env)
 * 3. BYOK (User's own key)
 * 
 * FOR OTHER SERVICES:
 * 1. User Setting (by_userId) → Global app_settings → process.env
 */
export async function resolveApiKey(
  ctx: KeyContext,
  envVarName: string,
  settingsField?: string
): Promise<string | null> {
  const isGemini = settingsField === 'gemini';
  
  // 1. Get identity and check if Admin
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;
  
  let isAdmin = false;
  if (identity) {
    // Check if admin matches process.env.ADMIN_USER_IDS or Node Dev mode
    const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
    isAdmin = adminIds.includes(userId!) || (process.env.NODE_ENV !== "production" && identity.subject === "fake_id");
  }

  // 2. Fetch User Settings (if authenticated)
  let userSettings: any = null;
  if (userId && 'runQuery' in ctx) {
    try {
      userSettings = await (ctx as ActionCtx).runQuery(
        api.userSettings.get,
        { userId }
      );
    } catch (e) { /* ignore */ }
  }

  // 3. SPECIAL LOGIC FOR GEMINI (Align with src/lib/gemini-key-resolver.ts)
  if (isGemini) {
    // a) Check BYOK (User's own key) FIRST (The Golden Rule: BYOK > System > Env)
    const byok = userSettings?.geminiApiKey || userSettings?.apiKeys?.gemini;
    if (isValidKey(byok, true)) return byok.trim();

    const isSubscribed = userSettings?.isSubscribed || false;
    const isTrialActive = userSettings?.isTrialActive && (userSettings?.trialEndsAt || 0) > Date.now();
    
    // b) Admins, Subscribed, and Trial users fallback to System Key if no BYOK
    if (isAdmin || isSubscribed || isTrialActive) {
      const systemKey = await getSystemKey(ctx, "GEMINI_API_KEY", "gemini");
      if (systemKey) return systemKey;
    }
    
    // c) Final fallback for any other context
    return await getSystemKey(ctx, "GEMINI_API_KEY", "gemini");
  }

  // 4. STANDARD LOGIC FOR OTHER KEYS
  // a) User Settings
  if (settingsField && userSettings?.apiKeys?.[settingsField]) {
    const key = userSettings.apiKeys[settingsField];
    if (isValidKey(key, isGemini)) return key.trim();
  }

  // b) System Key (Global Settings -> Env)
  return await getSystemKey(ctx, envVarName, settingsField);
}

/**
 * Fetches the system-level key from App Settings or Environment Variables.
 * Priority: App Settings (DB) > Environment Variables (process.env)
 */
async function getSystemKey(
  ctx: KeyContext,
  envVarName: string,
  settingsField?: string
): Promise<string | null> {
  // 1. Check Global app_settings (DB)
  const isGemini = settingsField === 'gemini';
  try {
    const appSettings = await (ctx as ActionCtx).runQuery(
      api.settings.getSettings,
      {}
    );
    if (settingsField && appSettings?.apiKeys?.[settingsField]) {
      const key = appSettings.apiKeys[settingsField];
      if (isValidKey(key, isGemini)) return key.trim();
    }
  } catch (e) { /* ignore */ }

  // 2. Check Environment variable
  const envKey = process.env[envVarName];
  if (isValidKey(envKey, isGemini)) return envKey!.trim();
  
  return null;
}

