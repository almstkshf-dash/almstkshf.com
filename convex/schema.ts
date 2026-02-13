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

    media_reports: defineTable({
        reportName: v.string(),
        source: v.union(v.literal("TV"), v.literal("Radio"), v.literal("Press")),
        status: v.union(v.literal("Draft"), v.literal("Published")),
        timestamp: v.number(),
        summary: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
    }).index("by_source", ["source"]),

    crisis_plans: defineTable({
        title: v.string(),
        priority: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
        actions: v.array(v.string()),
        status: v.string(),
        monitor_id: v.optional(v.id("media_reports")),
    }),

    user_settings: defineTable({
        userId: v.string(),
        kycStatus: v.union(v.literal("Pending"), v.literal("Verified"), v.literal("Rejected")),
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
        tone: v.string(),
        recommendation: v.string(),
        timestamp: v.number(),
    }),

    waitlist: defineTable({
        email: v.string(),
        name: v.optional(v.string()), // Optional name
        service: v.string(),          // e.g., "styling_assistant"
        timestamp: v.number(),
    }).index("by_email", ["email"]),
});
