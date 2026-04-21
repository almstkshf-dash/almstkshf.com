/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import 'server-only';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { resolveGeminiKey } from "./gemini-key-resolver";

interface MediaAnalysis {
    sentiment: "Positive" | "Neutral" | "Negative";
    brandName: string;
    sourceCountry: string; // ISO Code
}

/**
 * analyzes media content using Gemini via Vercel AI SDK.
 * Implements region-specific sentiment logic for the GCC market.
 */
export async function analyzeContent(text: string, title?: string): Promise<MediaAnalysis> {
    const { key: apiKey, error: resolutionError } = await resolveGeminiKey();

    if (!apiKey) {
        console.error("Gemini Key Resolution Failed:", resolutionError);
        return { sentiment: "Neutral", brandName: "Unknown", sourceCountry: "AE" }; // Fallback
    }

    try {
        const google = createGoogleGenerativeAI({ apiKey });
        
        const { object } = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: z.object({
                sentiment: z.enum(['Positive', 'Neutral', 'Negative']),
                brandName: z.string(),
                sourceCountry: z.string(),
            }),
            prompt: `
            Analyze the following text (Title + Content) within the context of UAE and Saudi Arabian media and legal sectors.
            
            TITLE: ${title || "N/A"}
            CONTENT: ${text.substring(0, 2000)}

            1. Sentiment (Positive/Neutral/Negative)? 
               *IMPORTANT*: In the UAE/Saudi context, "Negative" sentiment must explicitly involve regulatory breaches, legal action, financial fraud, public boycotts, or direct reputational damage. Constructive criticism or routine operational updates should be classified as "Neutral".
            2. Extract Brand Name (e.g. "AlMstkshf", "Toyota", etc.).
            3. Estimate 'Source Country' based on publication name or content context (Return 2-letter ISO Code, e.g. AE, SA, US). Default to AE if unsure.
            `,
        });

        return {
            sentiment: object.sentiment,
            brandName: object.brandName || "Unknown",
            sourceCountry: object.sourceCountry || "AE"
        };
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return { sentiment: "Neutral", brandName: "Unknown", sourceCountry: "AE" };
    }
}
