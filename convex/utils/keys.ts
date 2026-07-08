/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

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
    
    let identity: any = null;
    try {
        if (ctx.auth) {
            identity = await ctx.auth.getUserIdentity();
        }
    } catch (e) {
        console.warn("[resolveApiKey] Error getting user identity:", e);
    }

    let appSettings: any = null;
    try {
        if ("db" in ctx) {
            // Context has direct DB access (Mutation or Query) — bypasses authorization checks in public queries
            const dbRef = (ctx as QueryCtx | MutationCtx).db;
            appSettings = await dbRef
                .query("app_settings")
                .filter((q) => q.eq(q.field("type"), "global"))
                .first();
        } else {
            // Action context — must use runQuery
            // Using internal query to bypass redaction for server-side key resolution
            appSettings = await ctx.runQuery(internal.settings.getSystemSettings, {});
        }
    } catch (error) {
        console.warn(`[resolveApiKey] Error fetching global app settings for ${envVarName}:`, error);
    }

    let userSettings: any = null;
    if (identity) {
        try {
            if ("db" in ctx) {
                const dbRef = (ctx as QueryCtx | MutationCtx).db;
                userSettings = await dbRef
                    .query("userSettings")
                    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
                    .unique();
            } else {
                userSettings = await ctx.runQuery(api.userSettings.get, { userId: identity.subject });
            }
        } catch (error) {
            console.warn(`[resolveApiKey] Error fetching user settings for ${identity.subject}:`, error);
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

    // 3. Environment Variable - Final fallback
    return envKey;
}
