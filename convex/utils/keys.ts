import { Auth } from "convex/server";

export async function resolveApiKey(ctx: { auth: Auth, db: any }, keyName: string, envName: string): Promise<string | undefined> {
    // 1. Check user-specific settings (if user is authenticated)
    try {
        const identity = await ctx.auth.getUserIdentity();
        if (identity && identity.subject) {
            const userSettings = await ctx.db
                .query("userSettings")
                .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
                .first();
                
            if (userSettings?.apiKeys && typeof userSettings.apiKeys === 'object' && userSettings.apiKeys[keyName]) {
                return (userSettings.apiKeys[keyName] as string).trim();
            }
        }
    } catch (e) {
        // Ignore auth errors for unauthenticated requests
    }
    
    // 2. Check global app settings
    try {
        const globalSettings = await ctx.db
            .query("app_settings")
            .filter((q: any) => q.eq(q.field("type"), "global"))
            .first();
            
        if (globalSettings?.apiKeys && typeof globalSettings.apiKeys === 'object' && globalSettings.apiKeys[keyName]) {
            return (globalSettings.apiKeys[keyName] as string).trim();
        }
    } catch (e) {
        // Ignore DB errors
    }
    
    // 3. Fallback to process.env
    return process.env[envName]?.trim();
}
