import { action, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { resolveApiKey } from "./utils/keys";
import { callWithAiRetry } from "./utils/aiRetry";

// Define the expected structure from Gemini API
interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
}

// Define the expected analysis structure
interface AnalysisResult {
    sentiment: "Positive" | "Neutral" | "Negative";
    score: number;
    risk: "Low" | "Medium" | "High";
    riskScore: number; // 0-100
    tone: string;
    emotions: Record<string, number>; // e.g. { joy: 0.1, anger: 0.8 }
    topics: string[];
    entities: string[];
    recommendation: string;
}

/**
 * Expert Media & Reputation Intelligence Action
 */
export const analyzeMedia = action({
    args: { text: v.string() },
    handler: async (ctx, { text }): Promise<{ success: boolean; data?: AnalysisResult & { id: string; inputText: string }; error?: string; capacityExhausted?: boolean; retryAfter?: number }> => {
        const identity = await ctx.auth.getUserIdentity();
        const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

        if (!apiKey) {
            console.error("❌ CRITICAL CONFIG ERROR: GEMINI_API_KEY is missing from Convex environment variables.");
            return {
                success: false,
                error: "The AI service is not configured. Please add your Gemini API key in Settings or contact support. (Error: CFG_MISSING)"
            };
        }

        try {
            // Schedule background analysis
            const analysisId = await ctx.runMutation(api.analyses.createAnalysisPending, { inputText: text });
            await ctx.scheduler.runAfter(0, internal.media.analyzeMediaBackground, { analysisId, text });

            // Poll the database for completion (up to 50 seconds to gracefully stay under function timeouts)
            const startTime = Date.now();
            const timeoutMs = 50000;
            while (Date.now() - startTime < timeoutMs) {
                const analysis = await ctx.runQuery(api.analyses.getAnalysis, { id: analysisId });
                if (analysis) {
                    if (analysis.status === "completed") {
                        return {
                            success: true,
                            data: {
                                sentiment: analysis.sentiment as any,
                                score: analysis.score,
                                risk: analysis.risk as any,
                                riskScore: analysis.riskScore ?? 50,
                                tone: analysis.tone,
                                emotions: analysis.emotions || {},
                                topics: analysis.topics || [],
                                entities: analysis.entities || [],
                                recommendation: analysis.recommendation,
                                inputText: analysis.inputText,
                                id: analysisId,
                            }
                        };
                    } else if (analysis.status === "failed") {
                        return {
                            success: false,
                            error: analysis.error || "Analysis failed."
                        };
                    }
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            return {
                success: false,
                error: "Analysis is taking longer than expected. It is running in the background."
            };

        } catch (error: any) {
            console.error("ALMSTKSHF AI Engine Global Error:", error);
            return { success: false, error: "Analysis failed due to a system error. Our team has been notified." };
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
                sentiment: "Neutral",
                score: 50,
                risk: "Medium",
                riskScore: 50,
                tone: "Analytical",
                recommendation: "Error: The AI service is not configured.",
                status: "failed",
                error: "GEMINI_API_KEY missing from Convex configuration."
            });
            return;
        }

        const prompt = `You are an expert Media & Reputation Risk analyst.
Analyze the following text for sentiment, risk, emotions, and strategic impact.

IMPORTANT: Your response (especially "tone", "topics", "entities", and "recommendation") MUST be in the same language as the provided TEXT. If the TEXT is in Arabic, all descriptive fields in the JSON MUST be in Arabic.

TEXT:
"""
${text}
"""

Return valid JSON ONLY:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "score": number (0-100, 100=most positive),
  "risk": "Low" | "Medium" | "High",
  "riskScore": number (0-100, 100=extreme risk),
  "tone": "short phrase describing tone in input language",
  "emotions": { "joy": 0.x, "anger": 0.x, "sadness": 0.x, "fear": 0.x, "disgust": 0.x, "surprise": 0.x, "trust": 0.x, "anticipation": 0.x },
  "topics": ["topic1", "topic2"],
  "entities": ["entity1", "entity2"],
  "recommendation": "strategic advice (2 sentences) in input language"
}`;

        try {
            const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
            let finalResult: any = null;
            let lastError = "";

            for (const model of models) {
                try {
                    const result = await callWithAiRetry<any>(async () => {
                        return await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: prompt }] }],
                                    generationConfig: {
                                        temperature: 0.7,
                                        responseMimeType: "application/json",
                                        responseSchema: {
                                            type: "OBJECT",
                                            properties: {
                                                sentiment: { type: "STRING", enum: ["Positive", "Neutral", "Negative"] },
                                                score: { type: "INTEGER" },
                                                risk: { type: "STRING", enum: ["Low", "Medium", "High"] },
                                                riskScore: { type: "INTEGER" },
                                                tone: { type: "STRING" },
                                                emotions: {
                                                    type: "OBJECT",
                                                    properties: {
                                                        joy: { type: "NUMBER" },
                                                        anger: { type: "NUMBER" },
                                                        sadness: { type: "NUMBER" },
                                                        fear: { type: "NUMBER" },
                                                        disgust: { type: "NUMBER" },
                                                        surprise: { type: "NUMBER" },
                                                        trust: { type: "NUMBER" },
                                                        anticipation: { type: "NUMBER" }
                                                    },
                                                    required: ["joy", "anger", "sadness", "fear", "disgust", "surprise", "trust", "anticipation"]
                                                },
                                                topics: { type: "ARRAY", items: { type: "STRING" } },
                                                entities: { type: "ARRAY", items: { type: "STRING" } },
                                                recommendation: { type: "STRING" }
                                            },
                                            required: ["sentiment", "score", "risk", "riskScore", "tone", "emotions", "topics", "entities", "recommendation"]
                                        }
                                    },
                                }),
                            }
                        );
                    }, { maxRetries: 2 });

                    if (result.capacityExhausted) {
                        const err = new Error("MODEL_CAPACITY_EXHAUSTED");
                        (err as any).retryAfter = result.retryAfter;
                        throw err;
                    }

                    if (result.success && result.data) {
                        finalResult = result.data;
                        break;
                    } else {
                        lastError = `Model ${model} failed to return data.`;
                    }
                } catch (e: any) {
                    if (e.message === "MODEL_CAPACITY_EXHAUSTED") throw e;
                    lastError = `Fetch failed for ${model}: ${e.message}`;
                    continue;
                }
            }

            if (!finalResult) {
                throw new Error(`The AI service is currently unavailable. ${lastError}`);
            }

            const responseText = finalResult?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error("Received an empty response from our analysis engine.");
            }

            const analysis = JSON.parse(responseText.trim());

            // Validate and sanitize deeply to ensure type safety
            const validated = {
                sentiment: ["Positive", "Neutral", "Negative"].includes(analysis.sentiment)
                    ? analysis.sentiment
                    : "Neutral",
                score: typeof analysis.score === "number"
                    ? Math.max(0, Math.min(100, Math.round(analysis.score)))
                    : 50,
                risk: ["Low", "Medium", "High"].includes(analysis.risk)
                    ? analysis.risk
                    : "Medium",
                riskScore: typeof analysis.riskScore === "number"
                    ? Math.max(0, Math.min(100, Math.round(analysis.riskScore)))
                    : 50,
                tone: typeof analysis.tone === "string" && analysis.tone.length > 0
                    ? analysis.tone
                    : "Analytical",
                emotions: typeof analysis.emotions === "object" ? analysis.emotions : {},
                topics: Array.isArray(analysis.topics) ? analysis.topics : [],
                entities: Array.isArray(analysis.entities) ? analysis.entities : [],
                recommendation: typeof analysis.recommendation === "string" && analysis.recommendation.length > 0
                    ? analysis.recommendation
                    : "Further analysis recommended.",
            };

            await ctx.runMutation(api.analyses.updateAnalysisAfterAnalysis, {
                id: analysisId,
                ...validated,
                status: "completed"
            });
        } catch (error: any) {
            console.error("[analyzeMediaBackground] Error:", error);
            await ctx.runMutation(api.analyses.updateAnalysisAfterAnalysis, {
                id: analysisId,
                sentiment: "Neutral",
                score: 50,
                risk: "Medium",
                riskScore: 50,
                tone: "Analytical",
                recommendation: "Analysis failed due to a system error.",
                status: "failed",
                error: error.message || String(error)
            });
        }
    }
});

/**
 * Debug Action: List all available Gemini models for the current API Key.
 * Run this to verify which models are accessible.
 */
export const listModels = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            throw new ConvexError("GEMINI_API_KEY is missing via process.env");
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
