/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface ReportTranslations {
    brand_name?: string;
    logo_url?: string;
    brand_tagline?: string;
    footer_url?: string;
    Reports?: {
        pr_title?: string;
        deep_title?: string;
        osint_title?: string;
        col_image?: string;
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
        col_url?: string;
        col_tags?: string;
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
        page?: string;
        [key: string]: string | undefined;
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
            dob?: string;
            pob?: string;
            address?: string;
            issuing_authority?: string;
            issue_date?: string;
            expiry_date?: string;
            other_info?: string;
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
    sheet_name?: string;
    date?: string;
    title?: string;
    url?: string;
    type?: string;
    source?: string;
    publisher_username?: string;
    depth?: string;
    country?: string;
    sentiment?: string;
    relevancy?: string;
    reach?: string;
    likes?: string;
    retweets?: string;
    replies?: string;
    status?: string;
    ave?: string;
    hashtags?: string;
    generated_at?: string;
    page_count?: string;
    report_title?: string;
    total_articles?: string;
    keyword_label?: string;
    region_label?: string;
    langs_label?: string;
    summary_title?: string;
    total_reach?: string;
    ad_value?: string;
    sentiment_title?: string;
    sentiment_pos?: string;
    sentiment_neu?: string;
    sentiment_neg?: string;
    ai_recommendation?: string;
    rec_high_neg?: string;
    rec_mod_neg?: string;
    rec_healthy?: string;
    coverage_log?: string;
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
import { Doc, Id } from "../../convex/_generated/dataModel";

export type DarkWebResult = Doc<"darkweb_results">;

export type TerroristListItem = Doc<"local_terrorist_list">;

export type OsintLookupType = 'email' | 'domain' | 'ip' | 'username' | 'phone' | 'news' | 'corporate' | 'location' | 'wikipedia' | 'gleif' | 'watchlist' | 'gdelt';

export type OsintHistoryItem = Doc<"osint_results">;

export type DeepWebRun = Doc<"ingestion_runs_deep">;

export interface DeepWebResult {
    title: string;
    url: string;
    snippet?: string;
    source?: string;
    date?: string;
}

export type MonitoringArticle = Doc<"media_monitoring_articles">;
