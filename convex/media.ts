import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";

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
    tone: string;
    recommendation: string;
}

/**
 * Expert Media & Reputation Intelligence Action
 * Analyzes text for sentiment, risk, and strategic recommendations using Gemini AI.
 */
export const analyzeMedia = action({
    args: { text: v.string() },
    handler: async (ctx, { text }): Promise<AnalysisResult & { id: string; inputText: string }> => {
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        console.log(`Analyzing text: "${text.substring(0, 50)}..."`);

        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing via process.env");
            throw new ConvexError("AI service configuration error. Please contact support.");
        }

        // Build a precise prompt that forces unique, input-specific analysis
        const prompt = `You are an expert Media & Reputation Risk analyst for the ALMSTKSHF Intelligence platform.

Analyze the following text carefully. Your analysis MUST be specific to the actual content provided — do NOT give generic answers.

TEXT TO ANALYZE:
"""
${text}
"""

Provide your analysis as a JSON object with these exact fields:
- "sentiment": exactly one of "Positive", "Neutral", or "Negative"
- "score": a number from 0 to 100 representing sentiment confidence (0 = extremely negative, 50 = neutral, 100 = extremely positive)
- "risk": exactly one of "Low", "Medium", or "High" — assess reputational risk for an organization
- "tone": a single word or short phrase describing the emotional tone (e.g. "Alarming", "Promotional", "Hostile", "Optimistic", "Analytical", "Sarcastic")
- "recommendation": one specific, actionable strategic recommendation for a CEO based on THIS specific text (2-3 sentences max)

IMPORTANT: Your response must be ONLY the JSON object, nothing else. No markdown, no explanation.`;

        try {
            // Call Gemini API directly via REST to avoid SDK issues
            // Using gemini-1.5-flash for maximum stability
            // Helper function to call Gemini API
            const callGemini = async (model: string) => {
                console.log(`Attempting analysis with model: ${model}`);
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

            // Try primary model (Flash 2.5) first, fallback to Flash 2.0, then Flash Latest
            // Models confirmed available via listModels debug tool
            let response = await callGemini("gemini-2.5-flash");

            if (!response.ok && response.status === 404) {
                console.warn("Primary model (gemini-2.5-flash) not found, attempting fallback to gemini-2.0-flash...");
                response = await callGemini("gemini-2.0-flash");

                if (!response.ok && response.status === 404) {
                    console.warn("Fallback model (gemini-2.0-flash) not found, attempting final fallback to gemini-flash-latest...");
                    response = await callGemini("gemini-flash-latest");
                }
            }


            if (!response.ok) {
                const errorBody = await response.text();
                const RequestUrl = response.url;

                console.error(`Gemini API Error details:
                    Status: ${response.status} ${response.statusText}
                    URL: ${RequestUrl}
                    Body: ${errorBody}
                    Key Prefix: ${apiKey?.substring(0, 5)}...
                `);

                // Check for common issues
                if (response.status === 404) {
                    throw new ConvexError(`AI Service Error: Models (2.5-flash, 2.0-flash, flash-latest) not found. Please run 'npx convex run media:listModels' to see available models.`);
                }

                throw new ConvexError(`AI Service Provider Error: ${response.statusText} (${response.status}) - ${errorBody.substring(0, 100)}`);
            }

            const data = (await response.json()) as GeminiResponse;

            // Extract text from Gemini response
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                console.error("Empty Gemini response structure:", JSON.stringify(data));
                throw new ConvexError("Received empty response from AI service");
            }

            let analysis: any;
            try {
                // Parse JSON directly since responseMimeType ensures JSON format
                analysis = JSON.parse(responseText.trim());
            } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError, "Response Text:", responseText);
                throw new ConvexError("Invalid response format from AI service");
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
                tone: typeof analysis.tone === "string" && analysis.tone.length > 0
                    ? analysis.tone
                    : "Analytical",
                recommendation: typeof analysis.recommendation === "string" && analysis.recommendation.length > 0
                    ? analysis.recommendation
                    : "Further analysis recommended.",
            };

            // Save to database and return
            const saved = await ctx.runMutation(api.analyses.saveAnalysis, {
                inputText: text,
                ...validated,
            });

            return {
                ...validated,
                inputText: text,
                id: saved.id,
            };

        } catch (error: any) {
            console.error("ALMSTKSHF AI Engine Error:", error);

            // If it's already a ConvexError (from our explicit throws), re-throw it
            if (error instanceof ConvexError) {
                throw error;
            }

            // For unknown errors, provide a generic message to the client but log the real error
            // Ensure we log the full error object, stack, and any response details if available
            console.error("ALMSTKSHF AI Engine Unhandled Error:", {
                message: error.message,
                stack: error.stack,
                name: error.name,
                cause: error.cause,
                fullError: error
            });
            throw new ConvexError(error.message || "Analysis failed. Please try again.");
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
