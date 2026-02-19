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


    // PART 1: THE DATA SCHEMA (NON-NEGOTIABLE)
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
            newsdata: v.optional(v.string()),
            newsapi: v.optional(v.string()),
            gnews: v.optional(v.string()),
            worldnews: v.optional(v.string()),
            phylloClientId: v.optional(v.string()),
            phylloClientSecret: v.optional(v.string()),
            chatbaseId: v.optional(v.string()),
            chatbaseHost: v.optional(v.string()),
            stripePublishableKey: v.optional(v.string()),
            stripeSecretKey: v.optional(v.string()),
            stripeWebhookSecret: v.optional(v.string()),
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

    user_settings: defineTable({
        userId: v.string(),
        kycStatus: v.union(v.literal("Pending"), v.literal("Verified"), v.literal("Rejected")),
        phylloUserId: v.optional(v.string()),
        integrationApiKeys: v.optional(v.object({
            serviceA: v.string(),
            serviceB: v.string(),
        })),
        preferences: v.optional(v.any()),
    }).index("by_user_id", ["userId"]),

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
});
