/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { z } from "zod";
import { callWithAiRetry } from "./aiRetry";
import { getAnalysisPrompt } from "../prompts/analysis";
import { getRelevancyPrompt } from "../prompts/relevancy";
import { getMediaAnalysisPrompt } from "../prompts/mediaAnalysis";
import { runHeuristicsFallback } from "./heuristics";
import { logger } from "./logger";

export const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.5-flash"];

// ── ZOD SCHEMAS FOR RUNTIME TYPE SAFETY (LEGACY SCHEMA COMPATIBILITY) ─────────

export const SentimentSchema = z.enum(["Positive", "Neutral", "Negative"]);
export type Sentiment = z.infer<typeof SentimentSchema>;

export const RiskSchema = z.enum(["Low", "Medium", "High", "Critical"]);
export type Risk = z.infer<typeof RiskSchema>;

export const SourceTypeSchema = z.enum(["Online News", "Blog", "Press Release", "Social Media", "Print"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const EmotionsSchema = z.object({
    joy: z.number().default(0),
    sadness: z.number().default(0),
    anger: z.number().default(0),
    fear: z.number().default(0),
    surprise: z.number().default(0),
    trust: z.number().default(0)
});
export type Emotions = z.infer<typeof EmotionsSchema>;

export const ArticleAnalysisSchema = z.object({
    sentiment: SentimentSchema.default("Neutral"),
    summary: z.string(),
    sourceType: SourceTypeSchema.default("Online News"),
    reach_estimate: z.number().default(50000),
    tone: z.string().default("Analytical"),
    risk: RiskSchema.default("Medium"),
    hashtags: z.array(z.string()).default([]),
    emotions: EmotionsSchema.default({ joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, trust: 0 })
});
export type ArticleAnalysis = z.infer<typeof ArticleAnalysisSchema>;

export const RelevancyScoreSchema = z.object({
    relevancy_score: z.number().default(100),
    reason: z.string().default("")
});
export type RelevancyScore = z.infer<typeof RelevancyScoreSchema>;

// Free Text Insight / Media Analysis Schemas
export const FreeTextEmotionsSchema = z.object({
    joy: z.number().transform(v => Math.max(0, Math.min(1, v))),
    anger: z.number().transform(v => Math.max(0, Math.min(1, v))),
    sadness: z.number().transform(v => Math.max(0, Math.min(1, v))),
    fear: z.number().transform(v => Math.max(0, Math.min(1, v))),
    disgust: z.number().transform(v => Math.max(0, Math.min(1, v))),
    surprise: z.number().transform(v => Math.max(0, Math.min(1, v))),
    trust: z.number().transform(v => Math.max(0, Math.min(1, v))),
    anticipation: z.number().transform(v => Math.max(0, Math.min(1, v)))
});
export type FreeTextEmotions = z.infer<typeof FreeTextEmotionsSchema>;

export const FreeTextAnalysisResultSchema = z.object({
    sentiment: SentimentSchema,
    score: z.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))),
    risk: z.enum(["Low", "Medium", "High"]),
    riskScore: z.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))),
    tone: z.string().min(1).default("Analytical"),
    emotions: FreeTextEmotionsSchema,
    topics: z.array(z.string()).transform(arr => arr.filter(x => typeof x === "string")),
    entities: z.array(z.string()).transform(arr => arr.filter(x => typeof x === "string")),
    recommendation: z.string().min(1).default("Further analysis recommended.")
});
export type FreeTextAnalysisResult = z.infer<typeof FreeTextAnalysisResultSchema>;


// ── NEW PRODUCTION SCHEMAS FOR STRUCTURED LLM VALIDATION ───────────────────

const NewAnalysisResponseSchema = z.object({
    language: z.string().default("English"),
    confidence: z.number().default(100),
    sentiment: z.enum(["Positive", "Neutral", "Negative"]).default("Neutral"),
    sentimentScore: z.number().default(50),
    risk: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
    riskScore: z.number().default(0),
    urgency: z.enum(["Immediate", "Today", "Monitor", "Low Priority"]).default("Monitor"),
    action: z.enum(["Ignore", "Monitor", "Escalate", "Executive Review", "Legal Review", "PR Response"]).default("Monitor"),
    contentType: z.enum(["News", "Social Media", "Blog", "Forum", "Government", "Press Release", "Opinion", "TV", "Radio", "Print", "Podcast"]).default("News"),
    summary: z.string().default(""),
    tone: z.string().default("Analytical"),
    topics: z.array(z.string()).default([]),
    entities: z.object({
        people: z.array(z.string()).default([]),
        organizations: z.array(z.string()).default([]),
        locations: z.array(z.string()).default([]),
        brands: z.array(z.string()).default([]),
        government: z.array(z.string()).default([])
    }).default({ people: [], organizations: [], locations: [], brands: [], government: [] }),
    hashtags: z.array(z.string()).default([]),
    emotions: z.object({
        joy: z.number().default(0),
        sadness: z.number().default(0),
        anger: z.number().default(0),
        fear: z.number().default(0),
        surprise: z.number().default(0),
        trust: z.number().default(0),
        disgust: z.number().default(0),
        anticipation: z.number().default(0)
    }).default({ joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, trust: 0, disgust: 0, anticipation: 0 }),
    recommendation: z.string().default(""),
    reachEstimate: z.enum(["Unknown", "Low", "Medium", "High", "Very High"]).default("Unknown"),
    analysisVersion: z.string().default("1.0")
});
type NewAnalysisResponse = z.infer<typeof NewAnalysisResponseSchema>;

const NewRelevancyResponseSchema = z.object({
    relevancyScore: z.number().default(100),
    matchType: z.enum(["Primary", "Secondary", "Incidental", "None"]).default("Primary"),
    keywordMentioned: z.boolean().default(true),
    reason: z.string().default(""),
    confidence: z.number().default(100)
});
type NewRelevancyResponse = z.infer<typeof NewRelevancyResponseSchema>;


// ── GEMINI CONSTRAINTS SCHEMAS ───────────────────────────────────────────────

const GEMINI_NEW_ANALYSIS_SCHEMA = {
    type: "OBJECT",
    properties: {
        language: { type: "STRING" },
        confidence: { type: "INTEGER" },
        sentiment: { type: "STRING", enum: ["Positive", "Neutral", "Negative"] },
        sentimentScore: { type: "INTEGER" },
        risk: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
        riskScore: { type: "INTEGER" },
        urgency: { type: "STRING", enum: ["Immediate", "Today", "Monitor", "Low Priority"] },
        action: { type: "STRING", enum: ["Ignore", "Monitor", "Escalate", "Executive Review", "Legal Review", "PR Response"] },
        contentType: { type: "STRING", enum: ["News", "Social Media", "Blog", "Forum", "Government", "Press Release", "Opinion", "TV", "Radio", "Print", "Podcast"] },
        summary: { type: "STRING" },
        tone: { type: "STRING" },
        topics: { type: "ARRAY", items: { type: "STRING" } },
        entities: {
            type: "OBJECT",
            properties: {
                people: { type: "ARRAY", items: { type: "STRING" } },
                organizations: { type: "ARRAY", items: { type: "STRING" } },
                locations: { type: "ARRAY", items: { type: "STRING" } },
                brands: { type: "ARRAY", items: { type: "STRING" } },
                government: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["people", "organizations", "locations", "brands", "government"]
        },
        hashtags: { type: "ARRAY", items: { type: "STRING" } },
        emotions: {
            type: "OBJECT",
            properties: {
                joy: { type: "INTEGER" },
                sadness: { type: "INTEGER" },
                anger: { type: "INTEGER" },
                fear: { type: "INTEGER" },
                surprise: { type: "INTEGER" },
                trust: { type: "INTEGER" },
                disgust: { type: "INTEGER" },
                anticipation: { type: "INTEGER" }
            },
            required: ["joy", "sadness", "anger", "fear", "surprise", "trust", "disgust", "anticipation"]
        },
        recommendation: { type: "STRING" },
        reachEstimate: { type: "STRING", enum: ["Unknown", "Low", "Medium", "High", "Very High"] },
        analysisVersion: { type: "STRING" }
    },
    required: [
        "language", "confidence", "sentiment", "sentimentScore", "risk", "riskScore",
        "urgency", "action", "contentType", "summary", "tone", "topics", "entities",
        "hashtags", "emotions", "recommendation", "reachEstimate", "analysisVersion"
    ]
};

const GEMINI_NEW_RELEVANCY_SCHEMA = {
    type: "OBJECT",
    properties: {
        relevancyScore: { type: "INTEGER" },
        matchType: { type: "STRING", enum: ["Primary", "Secondary", "Incidental", "None"] },
        keywordMentioned: { type: "BOOLEAN" },
        reason: { type: "STRING" },
        confidence: { type: "INTEGER" }
    },
    required: ["relevancyScore", "matchType", "keywordMentioned", "reason", "confidence"]
};


// ── ADAPTER UTILITIES ────────────────────────────────────────────────────────

function mapContentTypeToSourceType(contentType: string): "Online News" | "Blog" | "Press Release" | "Social Media" | "Print" {
    switch (contentType) {
        case "News":
        case "Opinion":
            return "Online News";
        case "Social Media":
        case "Forum":
        case "Podcast":
            return "Social Media";
        case "Blog":
            return "Blog";
        case "Print":
        case "TV":
        case "Radio":
            return "Print";
        case "Press Release":
        case "Government":
            return "Press Release";
        default:
            return "Online News";
    }
}

function mapReachEstimateToNumeric(reach: string): number {
    switch (reach) {
        case "Low":
            return 5000;
        case "Medium":
            return 20000;
        case "High":
            return 100000;
        case "Very High":
            return 500000;
        case "Unknown":
        default:
            return 50000;
    }
}


// ── SHARED INTERNAL CORE CALL HANDLER ────────────────────────────────────────

async function callGeminiJson<T>(
    apiKey: string,
    prompt: string,
    zodSchema: z.ZodSchema<T>,
    geminiSchema: any,
    temperature = 0.3,
    maxRetries = 2
): Promise<T> {
    const log = logger.child({ requestId: "gemini-client" });
    const startTime = Date.now();

    for (const model of GEMINI_MODELS) {
        try {
            log.info(`🧠 Trying Gemini model: ${model} (prompt size: ${prompt.length} chars)`);
            const result = await callWithAiRetry<any>(async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // Robust 30s timeout
                
                try {
                    return await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: {
                                    temperature,
                                    responseMimeType: "application/json",
                                    responseSchema: geminiSchema,
                                },
                            }),
                            signal: controller.signal
                        }
                    );
                } finally {
                    clearTimeout(timeoutId);
                }
            }, { maxRetries });

            if (result.capacityExhausted) {
                log.warn(`⚠️ Model ${model} reports capacity exhaustion. Propagating retryAfter: ${result.retryAfter}s`);
                const err = new Error("MODEL_CAPACITY_EXHAUSTED") as any;
                err.retryAfter = result.retryAfter;
                throw err;
            }

            if (result.success && result.data) {
                const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) continue;

                const elapsed = Date.now() - startTime;
                log.info(`✅ Model ${model} succeeded. Elapsed time: ${elapsed}ms`);

                const parsed = JSON.parse(text.trim());
                return zodSchema.parse(parsed);
            }
        } catch (e: any) {
            if (e.message === "MODEL_CAPACITY_EXHAUSTED") throw e;
            log.warn(`⚠️ Model ${model} failed: ${e.message || e}`);
            continue;
        }
    }

    throw new Error("All Gemini models failed or key is missing.");
}


// ── API ENDPOINT INTEGRATIONS ────────────────────────────────────────────────

/**
 * Resolves content sentiment, risk, source, and emotion analysis using Gemini.
 * Falls back to heuristic analysis if API call fails.
 */
export async function callGeminiForAnalysis(
    apiKey: string | null,
    title: string,
    snippet: string,
    keyword: string,
    intendedCategories: string[] = []
): Promise<ArticleAnalysis> {
    const log = logger.child({ keyword });

    if (apiKey && apiKey !== "None") {
        try {
            const prompt = getAnalysisPrompt(title, snippet, keyword, intendedCategories);
            const raw = await callGeminiJson<NewAnalysisResponse>(
                apiKey,
                prompt,
                NewAnalysisResponseSchema,
                GEMINI_NEW_ANALYSIS_SCHEMA,
                0.3,
                2
            );

            // Adapt the new structured schema output to match legacy ArticleAnalysis expectations
            const legacyArticleAnalysis: ArticleAnalysis = {
                sentiment: raw.sentiment,
                summary: raw.summary,
                sourceType: mapContentTypeToSourceType(raw.contentType),
                reach_estimate: mapReachEstimateToNumeric(raw.reachEstimate),
                tone: raw.tone,
                risk: raw.risk,
                hashtags: raw.hashtags,
                emotions: {
                    joy: raw.emotions.joy,
                    sadness: raw.emotions.sadness,
                    anger: raw.emotions.anger,
                    fear: raw.emotions.fear,
                    surprise: raw.emotions.surprise,
                    trust: raw.emotions.trust
                }
            };

            return ArticleAnalysisSchema.parse(legacyArticleAnalysis);
        } catch (e: any) {
            if (e.message === "MODEL_CAPACITY_EXHAUSTED") throw e;
            log.error(`❌ Gemini analysis failed. Falling back to heuristics.`, e);
        }
    }

    log.warn("⚠️ Gemini API key is missing or models failed. Using heuristic fallback engine.");
    return runHeuristicsFallback(title, snippet);
}

/**
 * Evaluates relevancy score (0-100) using Gemini.
 * Falls open (returns 100) if API call fails.
 */
export async function callGeminiRelevancyScore(
    apiKey: string | null,
    title: string,
    snippet: string,
    keyword: string
): Promise<number> {
    const log = logger.child({ keyword });

    if (!apiKey || apiKey === "None") return 100; // Fail-open (pass) if no key

    try {
        const prompt = getRelevancyPrompt(title, snippet, keyword);
        const result = await callGeminiJson<NewRelevancyResponse>(
            apiKey,
            prompt,
            NewRelevancyResponseSchema,
            GEMINI_NEW_RELEVANCY_SCHEMA,
            0.1,
            1
        );
        log.info(`🎯 Relevancy [${result.relevancyScore}/100] (matchType: ${result.matchType}, confidence: ${result.confidence}) — ${result.reason || ""} — "${title.substring(0, 50)}"`);
        return result.relevancyScore;
    } catch (e: any) {
        if (e.message === "MODEL_CAPACITY_EXHAUSTED") throw e;
        log.warn(`⚠️ Relevancy check failed, falling open: ${e.message || e}`);
        return 100; // Fail-open
    }
}

/**
 * Resolves free text media reputation and risk analysis using Gemini with strict validation.
 */
export async function callGeminiForFreeAnalysis(
    apiKey: string,
    text: string
): Promise<FreeTextAnalysisResult> {
    const prompt = getMediaAnalysisPrompt(text);
    const raw = await callGeminiJson<NewAnalysisResponse>(
        apiKey,
        prompt,
        NewAnalysisResponseSchema,
        GEMINI_NEW_ANALYSIS_SCHEMA,
        0.2, // Low temperature for highly deterministic structured outputs
        2
    );

    // Adapt the new structured schema output to match legacy FreeTextAnalysisResult expectations
    const legacyFreeTextAnalysis: FreeTextAnalysisResult = {
        sentiment: raw.sentiment,
        score: raw.sentimentScore,
        // Map "Critical" risk to "High" to satisfy legacy z.enum(["Low", "Medium", "High"]) restriction
        risk: raw.risk === "Critical" ? "High" : raw.risk,
        riskScore: raw.riskScore,
        tone: raw.tone,
        // Scale emotions back to 0.0 - 1.0 range expected by legacy FreeTextEmotionsSchema
        emotions: {
            joy: raw.emotions.joy / 100,
            anger: raw.emotions.anger / 100,
            sadness: raw.emotions.sadness / 100,
            fear: raw.emotions.fear / 100,
            disgust: raw.emotions.disgust / 100,
            surprise: raw.emotions.surprise / 100,
            trust: raw.emotions.trust / 100,
            anticipation: raw.emotions.anticipation / 100
        },
        topics: raw.topics,
        // Flatten structured entities to flat string array expected by legacy schema
        entities: [
            ...raw.entities.people,
            ...raw.entities.organizations,
            ...raw.entities.locations,
            ...raw.entities.brands,
            ...raw.entities.government
        ],
        recommendation: raw.recommendation
    };

    return FreeTextAnalysisResultSchema.parse(legacyFreeTextAnalysis);
}
