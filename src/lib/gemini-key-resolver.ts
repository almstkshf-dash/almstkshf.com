import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Resolves the Gemini API Key to use for the current user session.
 * 
 * Hierarchy:
 * 1. Dev Mode: Always uses System Key.
 * 2. Subscribed: Uses System Key.
 * 3. Trial: Uses System Key if within 7 days.
 * 4. BYOK: Uses User's own Key if provided.
 */
export async function resolveGeminiKey(): Promise<{ key: string | null; error?: string }> {
    const { userId } = await auth();
    const systemKey = process.env.GEMINI_API_KEY || null;

    // 1. Dev Mode or Admin Bypass
    const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
    const isAdmin = userId && adminIds.includes(userId);

    if (process.env.NODE_ENV !== "production" || isAdmin) {
        return { key: systemKey };
    }

    if (!userId) {
        return { error: "User not authenticated" + (systemKey ? " (System Key available but user ID missing)" : ""), key: null };
    }

    try {
        // 2. Fetch User Settings
        let userSettings = await convex.query(api.userSettings.get, { userId });

        // 3. Auto-initialize user settings/trial if missing
        if (!userSettings) {
            await convex.mutation(api.userSettings.init, { userId });
            userSettings = await convex.query(api.userSettings.get, { userId });
        }

        if (!userSettings) {
            return { error: "Failed to initialize user settings", key: null };
        }

        // 4. Subscribed users use System Key
        if (userSettings.isSubscribed) {
            if (!systemKey) return { error: "System Key missing for subscribed user", key: null };
            return { key: systemKey };
        }

        // 5. Active Trial uses System Key
        if (userSettings.isTrialActive && userSettings.trialEndsAt && userSettings.trialEndsAt > Date.now()) {
            if (!systemKey) return { error: "System Key missing for trial user", key: null };
            return { key: systemKey };
        }

        // 6. BYOK (Bring Your Own Key)
        if (userSettings.geminiApiKey) {
            return { key: userSettings.geminiApiKey };
        }

        // 7. Expired Trial / No Key
        const trialExpired = userSettings.trialEndsAt && userSettings.trialEndsAt <= Date.now();
        if (trialExpired) {
            return { error: "Your free trial has expired. Please upgrade or add your own API key in Settings.", key: null };
        }

        return { error: "Missing API key. Please add your Gemini API key in Settings or upgrade your plan.", key: null };

    } catch (error) {
        console.error("Gemini Key Resolution Error:", error);
        return { error: "An error occurred while resolving API key", key: null };
    }
}
