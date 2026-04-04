import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";
import { resolveApiKey } from "./utils/keys";

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
    handler: async (ctx, { text }): Promise<{ success: boolean; data?: AnalysisResult & { id: string; inputText: string }; error?: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        const apiKey = await resolveApiKey(ctx, "GEMINI_API_KEY", "gemini");

        if (!apiKey) {
            console.error("❌ CRITICAL CONFIG ERROR: GEMINI_API_KEY is missing from Convex environment variables.");
            return {
                success: false,
                error: "The AI service is not configured. Please add your Gemini API key in Settings or contact support. (Error: CFG_MISSING)"
            };
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
            // Helper function to call Gemini API
            const callGemini = async (model: string) => {
                console.log(`🧠 Attempting analysis with model: ${model}`);
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.7,
                                responseMimeType: "application/json",
                            },
                        }),
                    }
                );
                return response;
            };

            // Diagnostics: Identify Key Source (Masked)
            const keyMasked = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "****";
            console.log(`🧠 AI Analysis Request: [Key: ${keyMasked}] [UserID: ${(identity?.subject || "ANONYMOUS").substring(0, 8)}]`);

            // Try models in sequence (Sync with monitoringAction.ts)
            const models = ["gemini-3.1-flash-preview", "gemini-3.0-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
            let response: Response | null = null;
            let lastError = "";

            for (const model of models) {
                try {
                    response = await callGemini(model);
                    if (response.ok) break;

                    const errText = await response.text();
                    lastError = `Model ${model} failed (${response.status}): ${errText}`;
                    console.warn(`⚠️ ${lastError}`);

                    // Only skip to next model if it's 404 (not found), 429 (rate limit), or 400 (bad request/invalid per model)
                    // We no longer break on 400 as different models might have different key restrictions
                } catch (e: any) {
                    lastError = `Fetch failed for ${model}: ${e.message}`;
                    console.warn(`⚠️ ${lastError}`);
                }
            }


            if (!response || !response.ok) {
                const status = response?.status || "UNKNOWN";
                return { 
                    success: false, 
                    error: `The AI service is currently unavailable (Status: ${status}). Please ensure your API key and quota are active. ${lastError.substring(0, 50)}` 
                };
            }

            const data = (await response.json()) as GeminiResponse;
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                console.error("Empty Gemini response structure:", JSON.stringify(data));
                return { success: false, error: "Received an empty response from our analysis engine." };
            }

            let analysis: any;
            try {
                analysis = JSON.parse(responseText.trim());
            } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError, "Response Text:", responseText);
                return { success: false, error: "Our analysis engine returned an unexpected format. Please try again." };
            }

            // Validate and sanitize deeply to ensure type safety
            const validated: AnalysisResult = {
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

            // Save to database
            const saved = await ctx.runMutation(api.analyses.saveAnalysis, {
                inputText: text,
                ...validated,
            });

            return {
                success: true,
                data: {
                    ...validated,
                    inputText: text,
                    id: (saved as any).id,
                }
            };

        } catch (error: any) {
            console.error("ALMSTKSHF AI Engine Global Error:", error);
            return { success: false, error: "Analysis failed due to a system error. Our team has been notified." };
        }
    },
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
