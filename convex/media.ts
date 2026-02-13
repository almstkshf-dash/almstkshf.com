import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Expert Media & Reputation Intelligence Action
 * Analyzes text for sentiment, risk, and strategic recommendations using Gemini AI.
 */
export const analyzeMedia = action({
    args: { text: v.string() },
    handler: async (ctx, { text }): Promise<{
        id: string;
        inputText: string;
        sentiment: string;
        score: number;
        risk: string;
        tone: string;
        recommendation: string;
    }> => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in Convex environment variables.");
            throw new Error("AI service is not configured. Please contact support.");
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
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Gemini API error:", response.status, errorBody);
                throw new Error(`Gemini API returned ${response.status}: ${errorBody}`);
            }

            const data = await response.json();

            // Extract text from Gemini response
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                console.error("Empty Gemini response:", JSON.stringify(data));
                throw new Error("Empty response from AI");
            }

            // Parse JSON - clean any markdown fences just in case
            const cleanText = responseText.replace(/```json|```/g, "").trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.error("Could not extract JSON from response:", cleanText);
                throw new Error("Invalid AI response format");
            }

            const analysis = JSON.parse(jsonMatch[0]);

            // Validate and sanitize
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
                tone: typeof analysis.tone === "string" && analysis.tone.length > 0
                    ? analysis.tone
                    : "Analytical",
                recommendation: typeof analysis.recommendation === "string" && analysis.recommendation.length > 0
                    ? analysis.recommendation
                    : "Further analysis recommended.",
            };

            // Save to database and return
            return await ctx.runMutation(api.analyses.saveAnalysis, {
                inputText: text,
                ...validated,
            });
        } catch (error: any) {
            console.error("ALMSTKSHF AI Engine Error:", error.message || error);
            // Re-throw so the client sees the actual error instead of getting fake data
            throw new Error(
                "Analysis failed. Please try again in a moment."
            );
        }
    },
});
