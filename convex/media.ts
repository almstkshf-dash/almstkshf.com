/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { resolveApiKey } from "./utils/keys";
import { requireAdmin } from "./utils/auth";
import { callGeminiForFreeAnalysis } from "./utils/gemini";

// Central default values for failed/pending analysis states
const DEFAULT_ANALYSIS = {
    sentiment: "Neutral" as const,
    score: 50,
    risk: "Medium" as const,
    riskScore: 50,
    tone: "Analytical",
};

/**
 * Expert Media & Reputation Intelligence Action
 */
export const analyzeMedia = action({
    args: { text: v.string() },
    handler: async (ctx, { text }): Promise<{ success: boolean; analysisId?: string; error?: string }> => {
        const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

        if (!apiKey) {
            console.error("❌ CRITICAL CONFIG ERROR: GEMINI_API_KEY is missing from Convex environment variables.");
            return {
                success: false,
                error: "The AI service is not configured. Please add your Gemini API key in Settings or contact support. (Error: CFG_MISSING)"
            };
        }

        // Input validation: reject empty, excessive, or malformed inputs
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            return { success: false, error: "Input text cannot be empty." };
        }
        if (trimmed.length > 100000) {
            return { success: false, error: "Input text is too long (maximum 100,000 characters)." };
        }

        try {
            // Limit processed text size to protect against cost and latency explosion
            const processedText = trimmed.length > 25000 
                ? trimmed.substring(0, 25000) + "\n[Text truncated for analysis length limits]" 
                : trimmed;

            // Schedule background analysis
            const analysisId = await ctx.runMutation(api.analyses.createAnalysisPending, { inputText: trimmed });
            await ctx.scheduler.runAfter(0, internal.media.analyzeMediaBackground, { 
                analysisId, 
                text: processedText 
            });

            return {
                success: true,
                analysisId,
            };

        } catch (error: unknown) {
            console.error("ALMSTKSHF AI Engine Global Error:", error);
            const errDetails = error instanceof Error ? error.message : String(error);
            return { 
                success: false, 
                error: `Analysis initiation failed due to a system error. Details: ${errDetails}` 
            };
        }
    },
});

export const analyzeMediaBackground = internalAction({
    args: { analysisId: v.id("free_analyses"), text: v.string() },
    handler: async (ctx, { analysisId, text }) => {
        const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
        if (!apiKey) {
            await ctx.runMutation(api.analyses.updateAnalysisAfterAnalysis, {
                id: analysisId,
                ...DEFAULT_ANALYSIS,
                recommendation: "Error: The AI service is not configured.",
                status: "failed",
                error: "GEMINI_API_KEY missing from Convex configuration."
            });
            return;
        }

        const startTime = Date.now();

        try {
            // Invoke structured analysis via central Gemini client utility
            const analysis = await callGeminiForFreeAnalysis(apiKey, text);
            const elapsed = Date.now() - startTime;
            
            console.log(`[analyzeMediaBackground] Success. ID: ${analysisId}, Input length: ${text.length}, Time: ${elapsed}ms`);

            await ctx.runMutation(api.analyses.updateAnalysisAfterAnalysis, {
                id: analysisId,
                ...analysis,
                status: "completed"
            });
        } catch (error: unknown) {
            const elapsed = Date.now() - startTime;
            console.error(`[analyzeMediaBackground] Error after ${elapsed}ms:`, error);
            
            let errorMessage = "Analysis failed due to a system error.";
            let statusError = "";

            if (error instanceof Error) {
                statusError = error.message;
                // Preserve specific retry advice if models are rate-limited / capacity-exhausted
                if (error.message === "MODEL_CAPACITY_EXHAUSTED" && ("retryAfter" in error)) {
                    errorMessage = `The AI service is temporarily overloaded. Please try again after ${String((error as any).retryAfter)} seconds.`;
                } else {
                    errorMessage = error.message;
                }
            } else {
                statusError = String(error);
                errorMessage = String(error);
            }

            await ctx.runMutation(api.analyses.updateAnalysisAfterAnalysis, {
                id: analysisId,
                ...DEFAULT_ANALYSIS,
                recommendation: errorMessage,
                status: "failed",
                error: statusError
            });
        }
    }
});

/**
 * Debug Action: List all available Gemini models for the current API Key.
 * Run this to verify which models are accessible. Secured for admin use only.
 */
export const listModels = action({
    args: {},
    handler: async (ctx) => {
        // Security: Restrict endpoint to admin users only
        await requireAdmin(ctx.auth);
        
        const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");
        if (!apiKey) {
            throw new ConvexError("GEMINI_API_KEY is missing from configuration.");
        }

        console.log("Listing available Gemini models...");
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: "GET" }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to list models: ${response.status} ${response.statusText}`, errorText);
            throw new ConvexError(`Failed to list models: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const models = data.models?.map((m: any) => m.name.replace('models/', '')) || [];

        console.log("Available Models:", models);
        return models;
    },
});
