/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { queryArticlesWithIndex } from "./helpers";

// 6. QUERY: Get Analytics Overview (NSS, Risk Score, etc.)
export const getAnalyticsOverview = query({
    args: {
        keyword: v.optional(v.string()),
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const q = queryArticlesWithIndex(ctx, args);
        // Optimize: Capped read limit (take 5000) to keep query scalable and avoid V8 transaction limits
        const articles = await q.take(5000);

        if (articles.length === 0) {
            return {
                nss: 0,
                riskScore: 0,
                velocity: 0,
                totalReach: 0,
                sentimentDistribution: { Positive: 0, Neutral: 0, Negative: 0 },
                crisisProbability: 0,
            };
        }

        const counts = { Positive: 0, Neutral: 0, Negative: 0 };
        let totalReach = 0;
        let weightedSentimentSum = 0;

        articles.forEach((a: Doc<"media_monitoring_articles">) => {
            counts[a.sentiment]++;
            totalReach += a.reach || 0;

            // NSS Calculation logic
            // Weight: Log(Reach + 1) as influence proxy
            const weight = Math.log10((a.reach || 0) + 1) || 1;
            const sentimentValue = a.sentiment === "Positive" ? 1 : a.sentiment === "Negative" ? -1 : 0;
            weightedSentimentSum += sentimentValue * weight;
        });

        // NSS = (Σ Weighted Sentiment) / Total Mentions * 100
        const nss = Math.round((weightedSentimentSum / articles.length) * 100);

        // Risk Score Composition
        const negativeDensity = counts.Negative / articles.length;
        
        // TODO: Implement actual velocity and topic sensitivity analytics
        // Currently these are static placeholder values for the risk score composition:
        const velocity = 0.05;
        const influencerNegativeWeight = 0.1;
        const topicSensitivity = 0.2;

        const riskScoreRaw = (negativeDensity * 0.4) + (velocity * 0.2) + (influencerNegativeWeight * 0.2) + (topicSensitivity * 0.2);
        const riskScore = Math.round(riskScoreRaw * 100);

        const sentimentDistribution = {
            Positive: Math.round((counts.Positive / articles.length) * 100),
            Neutral: Math.round((counts.Neutral / articles.length) * 100),
            Negative: Math.round((counts.Negative / articles.length) * 100),
        };

        // Identify Risk Factors
        const riskFactors: string[] = [];
        if (nss < -10) riskFactors.push("negative_sentiment_tilt");
        if (sentimentDistribution.Negative > 30) riskFactors.push("high_negative_volume");
        if (totalReach > 1000000 && nss < 0) riskFactors.push("viral_negative_reach");

        return {
            nss,
            riskScore,
            velocity,
            totalReach,
            sentimentDistribution,
            crisisProbability: Math.min(100, Math.round(riskScore * 1.2)),
            count: articles.length,
            riskFactors,
        };
    },
});

// 7. QUERY: Get Emotion Aggregates
export const getEmotionAggregates = query({
    args: {
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const q = queryArticlesWithIndex(ctx, args);
        // Optimize: Capped read limit (take 5000) to keep query scalable and avoid V8 transaction limits
        const articles = await q.take(5000);
        const emotions: Record<string, number> = { joy: 0, anger: 0, sadness: 0, fear: 0, disgust: 0, surprise: 0, trust: 0, anticipation: 0 };
        let count = 0;

        articles.forEach((a: Doc<"media_monitoring_articles">) => {
            // Priority 1: Dedicated emotions field
            if (a.emotions) {
                count++;
                Object.entries(a.emotions).forEach(([k, v]) => {
                    if (emotions[k] !== undefined) emotions[k] += (v as number);
                });
            }
            // Priority 2: Legacy tone field (if it's a JSON string containing emotions)
            else if (a.tone) {
                try {
                    const parsedTone = JSON.parse(a.tone);
                    if (parsedTone.emotions) {
                        count++;
                        Object.entries(parsedTone.emotions).forEach(([k, v]) => {
                            if (emotions[k] !== undefined) emotions[k] += (v as number);
                        });
                    }
                } catch (err) { /* skip unparseable tone */ }
            }
        });

        if (count > 0) {
            Object.keys(emotions).forEach(k => emotions[k] = parseFloat((emotions[k] / count).toFixed(2)));
        }

        return emotions;
    },
});

// 8. QUERY: Get Geography Aggregates
export const getGeographyAggregates = query({
    args: {
        sourceType: v.optional(v.string()),
        sourceCountry: v.optional(v.string()),
        depth: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const q = queryArticlesWithIndex(ctx, args);
        // Optimize: Capped read limit (take 5000) to keep query scalable and avoid V8 transaction limits
        const articles = await q.take(5000);
        const countries: Record<string, number> = {};

        articles.forEach((a: Doc<"media_monitoring_articles">) => {
            countries[a.sourceCountry] = (countries[a.sourceCountry] || 0) + 1;
        });

        return countries;
    },
});
