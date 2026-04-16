/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Returns an authenticated ConvexHttpClient for the current user session.
 * Uses Clerk JWT with the "convex" template for Convex auth.
 */
async function getAuthenticatedConvex(): Promise<ConvexHttpClient> {
    try {
        const { getToken } = await auth();
        const token = await getToken({ template: "convex" });
        if (token) {
            convex.setAuth(token);
        }
    } catch {
        // Auth token unavailable â€” proceed as anonymous (read-only queries may still work)
    }
    return convex;
}

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
    // envKey is the final fallback
    const envKey = process.env.GEMINI_API_KEY || null;

    if (!userId) {
        return { error: envKey ? undefined : "User not authenticated", key: envKey };
    }

    try {
        const client = await getAuthenticatedConvex();
        const userSettings = await client.query(api.userSettings.get, { userId });
        const appSettings = await client.query(api.settings.getSettings, {});
        
        // System Key priority: App Settings (DB) > Environment Variables
        const dbSystemKey = appSettings?.apiKeys?.gemini;
        const systemKey = (dbSystemKey && dbSystemKey !== "None") ? dbSystemKey : envKey;

        // 1. BYOK (User's own key) FIRST (The Golden Rule)
        if (userSettings?.geminiApiKey && userSettings.geminiApiKey !== "None") {
            return { key: userSettings.geminiApiKey };
        }

        // 2. Admin / Dev Mode Bypass (System Key)
        const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
        const isAdmin = adminIds.includes(userId);
        if (process.env.NODE_ENV !== "production" || isAdmin) {
            return { key: systemKey };
        }

        // 3. Subscribed / Trial users (System Key)
        if (userSettings?.isSubscribed) {
            return { key: systemKey };
        }
        if (userSettings?.isTrialActive && userSettings.trialEndsAt && userSettings.trialEndsAt > Date.now()) {
            return { key: systemKey };
        }

        // 4. Fallback/Error
        const trialExpired = userSettings?.trialEndsAt && userSettings.trialEndsAt <= Date.now();
        if (trialExpired) {
            return { error: "Your free trial has expired. Please upgrade or add your own API key in Settings.", key: null };
        }

        return { error: "Missing API key. Please add your Gemini API key in Settings or upgrade your plan.", key: null };

    } catch (error) {
        console.error("Gemini Key Resolution Error:", error);
        return { error: "An error occurred while resolving API key", key: null };
    }
}
