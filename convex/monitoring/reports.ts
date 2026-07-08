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
import { queryArticlesWithIndex, createTimestampCache } from "./helpers";
import { ReportRow } from "./types";

// 9. QUERY: Get Press Release Online News Reports
export const getPressReleaseOnlineNewsReports = query({
    args: { keyword: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const q = queryArticlesWithIndex(ctx, {
            keyword: args.keyword,
            sourceType: "Press Release",
        });

        // Optimize: Capped read limit (take 5000) to keep query scalable
        const articles = await q.take(5000);

        const getTimestamp = createTimestampCache();

        // Sort by publishedDate desc using cache helper
        articles.sort((a: Doc<"media_monitoring_articles">, b: Doc<"media_monitoring_articles">) => {
            const da = getTimestamp(a);
            const db = getTimestamp(b);
            return db - da;
        });

        return articles.map((article: Doc<"media_monitoring_articles">, index: number): ReportRow => ({
            No: index + 1,
            URL: article.url,
            "Published Date": article.publishedDate,
            Title: article.title,
            Content: article.content,
            Language: article.language,
            Sentiment: article.sentiment,
            "Source Type": article.sourceType,
            "Source Country": article.sourceCountry,
            Reach: article.reach,
            AVE: article.ave,
        }));
    },
});

// 10. QUERY: Get Press Release Social Media Reports
export const getPressReleaseSocialMediaReports = query({
    args: { keyword: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const q = queryArticlesWithIndex(ctx, {
            keyword: args.keyword,
            sourceType: "Social Media",
        });

        // Optimize: Capped read limit (take 5000) to keep query scalable
        const articles = await q.take(5000);

        const getTimestamp = createTimestampCache();

        // Sort by publishedDate desc using cache helper
        articles.sort((a: Doc<"media_monitoring_articles">, b: Doc<"media_monitoring_articles">) => {
            const da = getTimestamp(a);
            const db = getTimestamp(b);
            return db - da;
        });

        return articles.map((article: Doc<"media_monitoring_articles">, index: number): ReportRow => ({
            No: index + 1,
            URL: article.url,
            "Published Date": article.publishedDate,
            Title: article.title,
            Content: article.content,
            Language: article.language,
            Sentiment: article.sentiment,
            source_type: article.sourceType,
            "Source.country": article.sourceCountry,
            Reach: article.reach,
            AVE: article.ave,
        }));
    },
});
