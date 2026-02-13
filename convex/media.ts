import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

const handler: any = async (ctx: any, { text }: { text: string }) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return await ctx.runMutation((api as any).analyses.saveAnalysis, {
            inputText: text,
            sentiment: "Neutral",
            score: 50,
            risk: "Medium",
            tone: "Informative",
            recommendation: "Please set your GEMINI_API_KEY in the Convex dashboard for real-time AI analysis.",
        });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert Media & Reputation Intelligence agent for ALMSTKSHF.
    Analyze the following text for media sentiment and reputation risk:
    "${text}"

    Return ONLY a JSON object with this exact structure:
    {
        "sentiment": "Positive" | "Neutral" | "Negative",
        "score": number (0-100, where 100 is most positive),
        "risk": "Low" | "Medium" | "High",
        "tone": string (one or two words describing the emotional tone),
        "recommendation": string (one concise strategic sentence)
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Robust JSON extraction
        const cleanText = responseText.replace(/```json|```/g, "").trim();
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("Invalid JSON format in AI response");
        }

        const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
        const analysis = JSON.parse(jsonStr);

        return await ctx.runMutation((api as any).analyses.saveAnalysis, {
            inputText: text,
            sentiment: analysis.sentiment,
            score: analysis.score,
            risk: analysis.risk,
            tone: analysis.tone,
            recommendation: analysis.recommendation,
        });
    } catch (error: any) {
        console.error("AI Analysis failed:", error);

        // Fallback simulation for resiliency
        return await ctx.runMutation((api as any).analyses.saveAnalysis, {
            inputText: text,
            sentiment: "Neutral",
            score: 50,
            risk: "Medium",
            tone: "Analytic (Fallback)",
            recommendation: "AI analysis service is temporarily unavailable. This is a simulated estimation.",
        });
    }
};

export const analyzeMedia = action({
    args: { text: v.string() },
    handler,
});
