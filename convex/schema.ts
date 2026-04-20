/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    case_studies: defineTable({
        title: v.string(),
        description: v.string(),
        category: v.string(), // e.g., "lexcura_lawyer", "styling_assistant"
        imageUrl: v.optional(v.string()),
        content: v.optional(v.string()),
    }),

    media_monitoring_articles: defineTable({
        keyword: v.string(),
        url: v.string(),
        resolvedUrl: v.optional(v.string()), // The tracked final URL
        publishedDate: v.string(), // Format: DD/MM/YYYY
        title: v.string(),
        content: v.string(), // Short summary/snippet
        language: v.union(v.literal("EN"), v.literal("AR")),
        sentiment: v.union(v.literal("Positive"), v.literal("Neutral"), v.literal("Negative")),
        sourceType: v.union(v.literal("Online News"), v.literal("Social Media"), v.literal("Blog"), v.literal("Print"), v.literal("Press Release")),
        source: v.optional(v.string()),
        depth: v.optional(v.union(v.literal("standard"), v.literal("deep"))),
        ingestMethod: v.optional(v.union(v.literal("api"), v.literal("rss"), v.literal("headless"))),
        tone: v.optional(v.string()),
        risk: v.optional(v.string()),
        sourceCountry: v.string(), // ISO Code
        reach: v.number(),
        ave: v.number(),
        imageUrl: v.optional(v.string()), // For PDF thumbnails
        isManual: v.optional(v.boolean()), // To distinguish manual entries
        manualSentimentOverride: v.optional(v.boolean()),
        originalSentiment: v.optional(v.string()),
        hashtags: v.optional(v.array(v.string())), // Add hashtags
        likes: v.optional(v.number()),
        retweets: v.optional(v.number()),
        replies: v.optional(v.number()),
        relevancy_score: v.optional(v.number()),
        emotions: v.optional(v.object({
            joy: v.number(),
            sadness: v.number(),
            anger: v.number(),
            fear: v.number(),
            surprise: v.number(),
            trust: v.number(),
        })),
        createdAt: v.number(),
    }).index("by_date", ["publishedDate"]),

    ingestion_runs_deep: defineTable({
        startedAt: v.number(),
        status: v.union(v.literal("success"), v.literal("error")),
        source: v.string(),
        itemCount: v.number(),
        error: v.optional(v.string()),
    }).index("by_started_at", ["startedAt"]),

    // PART 3: SETTINGS
    app_settings: defineTable({
        type: v.literal("global"), // Singleton pattern
        logoUrl: v.optional(v.string()),
        apiKeys: v.object({
            gemini: v.optional(v.string()),
            instagram: v.optional(v.string()),
            twitter: v.optional(v.string()), // Deprecated, keeping for safety
            twitterBearer: v.optional(v.string()),
            twitterConsumerKey: v.optional(v.string()),
            twitterConsumerSecret: v.optional(v.string()),
            twitterAccessToken: v.optional(v.string()),
            twitterAccessTokenSecret: v.optional(v.string()),
            newsdata: v.optional(v.string()),
            newsapi: v.optional(v.string()),
            gnews: v.optional(v.string()),
            worldnews: v.optional(v.string()),
            bing: v.optional(v.string()),
            mediastack: v.optional(v.string()),
            serper: v.optional(v.string()),
            chatbaseId: v.optional(v.string()),
            chatbaseHost: v.optional(v.string()),
            stripePublishableKey: v.optional(v.string()),
            stripeSecretKey: v.optional(v.string()),
            stripeWebhookSecret: v.optional(v.string()),
            phylloClientId: v.optional(v.string()),
            phylloClientSecret: v.optional(v.string()),
            // OSINT keys
            hibp: v.optional(v.string()),
            whoisjson: v.optional(v.string()),
            abuseipdb: v.optional(v.string()),
            numverify: v.optional(v.string()),
            qstash: v.optional(v.string()),
            gleif: v.optional(v.string()), // Usually public, but adding for future-proofing
            opensanctions: v.optional(v.string()), // For Watchlist checks
            diffbot: v.optional(v.string()),
            zenrows: v.optional(v.string()),
        }),
        defaults: v.object({
            targetCountries: v.array(v.string()),
            aveMultiplier: v.number(),
        }),
    }),

    crisis_plans: defineTable({
        title: v.string(),
        priority: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
        actions: v.array(v.string()),
        status: v.string(),
        monitor_id: v.optional(v.id("media_monitoring_articles")),
    }),

    contact_submissions: defineTable({
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
        timestamp: v.number(),
    }),

    free_analyses: defineTable({
        inputText: v.string(),
        sentiment: v.string(),
        score: v.number(),
        risk: v.string(),
        riskScore: v.optional(v.number()),
        tone: v.string(),
        emotions: v.optional(v.any()), // Map of emotions
        topics: v.optional(v.array(v.string())),
        entities: v.optional(v.array(v.string())),
        recommendation: v.string(),
        timestamp: v.number(),
    }),

    waitlist: defineTable({
        email: v.string(),
        name: v.optional(v.string()), // Optional name
        service: v.string(),          // e.g., "styling_assistant"
        timestamp: v.number(),
        timestamp_ms: v.optional(v.number()),
    }).index("by_email", ["email"]),

    // OSINT Investigation Results
    osint_results: defineTable({
        type: v.union(
            v.literal("email"),
            v.literal("domain"),
            v.literal("ip"),
            v.literal("username"),
            v.literal("phone"),
            v.literal("gdelt"),
            v.literal("news"),
            v.literal("corporate"),
            v.literal("location"),
            v.literal("wikipedia"),
            v.literal("gleif"),
            v.literal("watchlist")
        ),
        query: v.string(),
        result: v.any(),
        userId: v.string(),
        createdAt: v.number(),
    })
        .index("by_created_at", ["createdAt"])
        .index("by_user_id", ["userId"]),

    // Dark Web Scan Results
    darkweb_results: defineTable({
        query: v.string(),
        source_type: v.union(v.literal("ahmia"), v.literal("diffbot"), v.literal("zenrows")),
        url: v.string(),
        title: v.string(),
        snippet: v.string(),
        risk_level: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        country_origin: v.optional(v.string()),
        discovered_at: v.number(),
        user_id: v.string(),
        summary: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    })
        .index("by_user_id", ["user_id"])
        .index("by_discovered_at", ["discovered_at"])
        .index("by_risk_level", ["risk_level"])
        .index("by_user_id_and_risk_level", ["user_id", "risk_level"]),

    payments: defineTable({
        stripeSessionId: v.string(),
        userId: v.optional(v.string()),
        amount: v.number(),
        currency: v.string(),
        status: v.string(),
        productName: v.string(),
        customerEmail: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_session_id", ["stripeSessionId"])
        .index("by_user_id", ["userId"]),

    subscriptions: defineTable({
        userId: v.string(),
        stripeSubscriptionId: v.string(),
        stripePriceId: v.string(),
        stripeCustomerId: v.string(),
        status: v.string(), // active, trialing, canceled, etc.
        currentPeriodEnd: v.number(),
        cancelAtPeriodEnd: v.boolean(),
        updatedAt: v.number(),
    }).index("by_user_id", ["userId"])
        .index("by_subscription_id", ["stripeSubscriptionId"]),

    userSettings: defineTable({
        userId: v.string(),
        geminiApiKey: v.optional(v.string()),
        apiKeys: v.optional(v.object({
            gemini: v.optional(v.string()),
            newsdata: v.optional(v.string()),
            newsapi: v.optional(v.string()),
            gnews: v.optional(v.string()),
            worldnews: v.optional(v.string()),
            bing: v.optional(v.string()),
            mediastack: v.optional(v.string()),
            serper: v.optional(v.string()),
            twitterBearer: v.optional(v.string()),
            twitterConsumerKey: v.optional(v.string()),
            twitterConsumerSecret: v.optional(v.string()),
            twitterAccessToken: v.optional(v.string()),
            twitterAccessTokenSecret: v.optional(v.string()),
            hibp: v.optional(v.string()),
            whoisjson: v.optional(v.string()),
            abuseipdb: v.optional(v.string()),
            numverify: v.optional(v.string()),
            qstash: v.optional(v.string()),
            gleif: v.optional(v.string()),
            opensanctions: v.optional(v.string()),
            diffbot: v.optional(v.string()),
            zenrows: v.optional(v.string()),
        })),
        isSubscribed: v.optional(v.boolean()),
        isTrialActive: v.optional(v.boolean()),
        trialEndsAt: v.optional(v.number()),
        kycStatus: v.optional(v.union(v.literal("Pending"), v.literal("Verified"), v.literal("Rejected"))),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_userId", ["userId"]),

    notifications: defineTable({
        userId: v.string(),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("alert"), v.literal("system"), v.literal("billing")),
        isRead: v.boolean(),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),

    local_terrorist_list: defineTable({
        type: v.union(v.literal("individual"), v.literal("organization"), v.literal("entity")),
        category: v.string(), // e.g., "Ø´Ø®Øµ Ø¥Ø±Ù‡Ø§Ø¨ÙŠ", "ØªÙ†Ø¸ÙŠÙ… Ø¥Ø±Ù‡Ø§Ø¨ÙŠ"
        nameArabic: v.string(),
        nameLatin: v.string(),
        nationality: v.optional(v.string()),
        dob: v.optional(v.string()),
        pob: v.optional(v.string()),
        address: v.optional(v.string()),
        documentNumber: v.optional(v.string()),
        issuingAuthority: v.optional(v.string()),
        issueDate: v.optional(v.string()),
        expiryDate: v.optional(v.string()),
        otherInfo: v.optional(v.string()),
        reasons: v.optional(v.string()),
        searchField: v.string(), // Concatenated string for built-in search
    }).searchIndex("by_searchField", {
        searchField: "searchField",
        filterFields: ["type"],
    }),

    collections: defineTable({
        userId: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        items: v.array(v.object({
            id: v.string(),
            type: v.union(
                v.literal("media_monitoring"),
                v.literal("osint"),
                v.literal("ai_inspector"),
                v.literal("watchlist"),
                v.literal("deep_web"),
                v.literal("custom")
            ),
            title: v.string(),
            sourceId: v.optional(v.string()),
            data: v.any(),
            addedAt: v.number(),
        })),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_userId", ["userId"]),

    user_reports: defineTable({
        userId: v.string(),
        type: v.union(v.literal("pdf"), v.literal("csv"), v.literal("excel")),
        articleCount: v.number(),
        timestamp: v.number(),
    }).index("by_userId", ["userId"]),
});
