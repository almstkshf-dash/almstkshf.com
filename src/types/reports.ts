/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface ReportTranslations {
    brand_name?: string;
    Reports?: {
        pr_title?: string;
        deep_title?: string;
        osint_title?: string;
        col_date?: string;
        col_title?: string;
        col_source?: string;
        col_reach?: string;
        col_ave?: string;
        col_summary?: string;
        col_time?: string;
        col_status?: string;
        col_count?: string;
        col_sentiment?: string;
        summary?: string;
        total_reach?: string;
        total_ave?: string;
        article_count?: string;
        coverage_details?: string;
        ingestion_logs?: string;
        identified_threats?: string;
        generated_at?: string;
        data_points?: string;
        investigation_target?: string;
        investigation_type?: string;
        technical_details?: string;
        attribute?: string;
        value?: string;
        entity_map?: string;
        entity_name?: string;
        entity_type?: string;
        relevance?: string;
    };
    DarkWeb?: {
        tab_label?: string;
        col_risk?: string;
    };
    TerroristList?: {
        title?: string;
        fields?: {
            name_arabic?: string;
            name_latin?: string;
            nationality?: string;
            doc_number?: string;
            category?: string;
            reasons?: string;
        };
    };
    AiInspector?: {
        results_summary?: string;
        label_mode?: string;
        label_risk?: string;
        label_confidence?: string;
        linguistic_signals?: string;
        visual_signals?: string;
        biometric_scouts?: string;
        frame_analysis?: string;
        none?: string;
        col_sentence?: string;
        col_flags?: string;
        col_ai_prob?: string;
        col_signal?: string;
        col_desc?: string;
        col_value?: string;
        col_risk?: string;
        col_feature?: string;
        col_detail?: string;
        col_status?: string;
        col_time?: string;
        col_anomaly?: string;
        col_severity?: string;
        anatomy_consistency?: string;
        anomaly_detected?: string;
        anomaly_low_risk?: string;
        risk_low?: string;
        risk_medium?: string;
        risk_high?: string;
        ocr_detect?: string;
        detected_ai_signature?: string;
        [key: string]: string | undefined; // Allow for dynamic mode/risk translations
    };
    OsintTab?: {
        export_history?: string;
    };
    [key: string]: unknown;
}

export interface AiInspectorData {
    overallRisk?: string;
    confidenceScore?: number;
    sentenceBreakdown?: Array<{
        text: string;
        flags: string[];
        aiProbability: number;
    }>;
    pixelLogicSignals?: Array<{
        label: string;
        description: string;
        detectedValue: string;
        risk: string;
    }>;
    deepMl?: {
        biometrics?: {
            faceAnomalies?: Array<{ id: string; name?: string }>;
            handAnomalies?: Array<{ id: string; name?: string }>;
        };
        ocr?: {
            text?: string;
            isGarbled?: boolean;
        };
        watermarks?: Array<{ id: string; name?: string }>;
    };
    frameAnomalies?: Array<{
        timestamp: string;
        type: string;
        severity: number;
        description: string;
    }>;
}

export interface DarkWebResult {
    publishedDate?: string | number | Date;
    title?: string;
    source_type?: string;
    risk_level?: string;
    summary?: string;
    [key: string]: unknown;
}

export interface TerroristListItem {
    nameArabic?: string;
    nameLatin?: string;
    nationality?: string;
    documentNumber?: string;
    category?: string;
    reasons?: string;
    [key: string]: unknown;
}

export type OsintLookupType = 'email' | 'domain' | 'ip' | 'username' | 'phone' | 'news' | 'corporate' | 'location' | 'wikipedia' | 'gleif' | 'watchlist';

export interface OsintHistoryItem {
    _id: string;
    _creationTime: number;
    type: OsintLookupType;
    query: string;
    result: Record<string, unknown>; // Raw API response data varies significantly by lookup type
    userId: string;
    createdAt: number;
}

export interface DeepWebRun {
    _id: string;
    startedAt: number;
    status: 'success' | 'failed' | 'running';
    itemCount: number;
    error?: string;
    languages?: string;
    countries?: string;
}

export interface DeepWebResult {
    title: string;
    url: string;
    snippet?: string;
    source?: string;
    date?: string;
}

export interface MonitoringArticle {
    _id: string;
    _creationTime?: number;
    title: string;
    publishedDate: string;
    url: string;
    resolvedUrl?: string;
    source?: string;
    sourceType: 'Press Release' | 'Online News' | 'Social Media' | 'Blog' | 'Print' | string;
    sourceCountry?: string;
    country?: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative' | string;
    depth?: 'standard' | 'deep';
    relevancy_score?: number;
    reach?: number;
    ave?: number;
    likes?: number;
    retweets?: number;
    replies?: number;
    status?: 'live' | 'in_progress' | string;
    imageUrl?: string;
    isManual?: boolean;
    manualSentimentOverride?: boolean;
    originalSentiment?: string;
    [key: string]: unknown;
}
