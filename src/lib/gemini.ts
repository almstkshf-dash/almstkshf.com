/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import 'server-only';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiKey } from "./gemini-key-resolver";

interface MediaAnalysis {
    sentiment: "Positive" | "Neutral" | "Negative";
    brandName: string;
    sourceCountry: string; // ISO Code
}

export async function analyzeContent(text: string, title?: string): Promise<MediaAnalysis> {
    const { key: apiKey, error: resolutionError } = await resolveGeminiKey();

    if (!apiKey) {
        console.error("Gemini Key Resolution Failed:", resolutionError);
        return { sentiment: "Neutral", brandName: "Unknown", sourceCountry: "AE" }; // Fallback
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Analyze the following text (Title + Content) within the context of UAE and Saudi Arabian media and legal sectors.
    
    TITLE: ${title || "N/A"}
    CONTENT: ${text.substring(0, 2000)}

    1. Sentiment (Positive/Neutral/Negative)? 
       *IMPORTANT*: In the UAE/Saudi context, "Negative" sentiment must explicitly involve regulatory breaches, legal action, financial fraud, public boycotts, or direct reputational damage. Constructive criticism or routine operational updates should be classified as "Neutral".
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
