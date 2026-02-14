import { GoogleGenerativeAI } from "@google/generative-ai";

interface MediaAnalysis {
    sentiment: "Positive" | "Neutral" | "Negative";
    brandName: string;
    sourceCountry: string; // ISO Code
}

export async function analyzeContent(text: string, title?: string): Promise<MediaAnalysis> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Gemini API Key missing");
        return { sentiment: "Neutral", brandName: "Unknown", sourceCountry: "AE" }; // Fallback
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Analyze the following text (Title + Content).
    
    TITLE: ${title || "N/A"}
    CONTENT: ${text.substring(0, 2000)}

    1. Sentiment (Positive/Neutral/Negative)?
    2. Extract Brand Name (e.g. "AlMstkshf", "Toyota", etc.).
    3. Estimate 'Source Country' based on publication name or content context (Return 2-letter ISO Code, e.g. AE, SA, US). Default to AE if unsure.

    Return strictly valid JSON:
    {
        "sentiment": "Positive" | "Neutral" | "Negative",
        "brandName": "string",
        "sourceCountry": "ISO_CODE"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const json = JSON.parse(text);

        return {
            sentiment: ["Positive", "Neutral", "Negative"].includes(json.sentiment) ? json.sentiment : "Neutral",
            brandName: json.brandName || "Unknown",
            sourceCountry: json.sourceCountry || "AE"
        };
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return { sentiment: "Neutral", brandName: "Unknown", sourceCountry: "AE" };
    }
}
