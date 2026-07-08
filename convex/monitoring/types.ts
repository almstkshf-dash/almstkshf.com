/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Id } from "../_generated/dataModel";

export interface EmotionScores {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    trust: number;
    disgust?: number;
    anticipation?: number;
}

export interface AnalyticsOverview {
    nss: number;
    riskScore: number;
    velocity: number;
    totalReach: number;
    sentimentDistribution: {
        Positive: number;
        Neutral: number;
        Negative: number;
    };
    crisisProbability: number;
    count: number;
    riskFactors: string[];
}

export interface ReportRow {
    No: number;
    URL: string;
    "Published Date": string;
    Title: string;
    Content: string;
    Language: "EN" | "AR";
    Sentiment: "Positive" | "Neutral" | "Negative";
    "Source Type"?: string;
    source_type?: string;
    "Source Country"?: string;
    "Source.country"?: string;
    Reach: number;
    AVE: number;
}

export interface QueueItem {
    _id: Id<"scraper_queue">;
    _creationTime: number;
    url: string;
    articleId: Id<"media_monitoring_articles">;
    status: "pending" | "processing" | "completed" | "failed";
    retryCount: number;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

export interface ArticleFilters {
    limit?: number;
    skip?: number;
    sourceType?: string;
    sourceCountry?: string;
    depth?: string;
    keyword?: string;
}
