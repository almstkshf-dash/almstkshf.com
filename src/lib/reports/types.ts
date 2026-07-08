/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { ReportTranslations, AiInspectorData, DarkWebResult, TerroristListItem, DeepWebRun, OsintHistoryItem } from '@/types/reports';

export type { ReportTranslations, AiInspectorData, DarkWebResult, TerroristListItem, DeepWebRun, OsintHistoryItem };

export interface ReportArticle {
    title: string;
    publishedDate?: string;
    url?: string;
    resolvedUrl?: string;
    imageUrl?: string;
    source?: string;
    sourceType?: string;
    publisherUsername?: string;
    sentiment?: string;
    reach?: number;
    ave?: number;
    likes?: number;
    retweets?: number;
    replies?: number;
    depth?: string;
    sourceCountry?: string;
    status?: string;
    relevancy_score?: number;
    hashtags?: string[];
    content?: string;
    keyword?: string;
    [key: string]: unknown;
}

export type OsintResult = OsintHistoryItem;

export const BRAND_DARK = [31, 78, 120] as [number, number, number];
export const BRAND_AMBER = [218, 165, 32] as [number, number, number];
export const ACCENT_BG = [241, 245, 249] as [number, number, number];
