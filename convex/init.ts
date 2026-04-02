import { internalMutation, mutation } from "./_generated/server";

export const seed = mutation({
    handler: async (ctx) => {
        // Clear existing data (optional, but good for clean seeding)
        // const existingReports = await ctx.db.query("media_reports").collect();
        // for (const report of existingReports) {
        //     await ctx.db.delete(report._id);
        // }

        // Seed Media Monitoring Articles (New Model)
        const articles = [
            {
                keyword: "Economy",
                url: "https://example.com/news1",
                publishedDate: "19/02/2026",
                title: "Daily Media Monitoring - morning session",
                content: "Analysis of prime time news coverage in the Gulf region.",
                language: "EN" as const,
                sentiment: "Neutral" as const,
                sourceType: "Online News" as const,
                sourceCountry: "AE",
                reach: 50000,
                ave: 1200,
                createdAt: Date.now() - 3600000,
            },
            {
                keyword: "Policy",
                url: "https://example.com/news2",
                publishedDate: "18/02/2026",
                title: "Economic Analysis Report",
                content: "Sentiment analysis on recent market policy changes.",
                language: "EN" as const,
                sentiment: "Positive" as const,
                sourceType: "Blog" as const,
                sourceCountry: "SA",
                reach: 25000,
                ave: 800,
                createdAt: Date.now() - 7200000,
            },
            {
                keyword: "Public Opinion",
                url: "https://example.com/news3",
                publishedDate: "19/02/2026",
                title: "Radio Talk Show Summary",
                content: "Compilation of call-in comments regarding public services.",
                language: "AR" as const,
                sentiment: "Negative" as const,
                sourceType: "Social Media" as const,
                sourceCountry: "AE",
                reach: 15000,
                ave: 450,
                createdAt: Date.now() - 500000,
            }
        ];

        for (const article of articles) {
            await ctx.db.insert("media_monitoring_articles", article);
        }

        // Seed Crisis Plans
        const plans = [
            {
                title: "Reputation Management Plan - Retail Sector",
                priority: "High" as const,
                actions: ["Monitor social media shifts", "Prepare executive statement", "Coordinate with legal"],
                status: "Active"
            },
            {
                title: "PR Response Strategy - Public Sector",
                priority: "Medium" as const,
                actions: ["Draft press release", "Brief stakeholders"],
                status: "Pending"
            }
        ];

        for (const plan of plans) {
            await ctx.db.insert("crisis_plans", plan);
        }

        // Seed Case Studies
        const caseStudies = [
            {
                title: "Legal Document Automation",
                description: "Streamlining contract review for a leading law firm.",
                category: "lexcura_lawyer",
                imageUrl: "/lexcora_dashboard.png",
                content: "Detailed analysis of how AI automated 80% of contract review tasks."
            },
            {
                title: "AI-Powered Fashion Stylist",
                description: "Personalized fashion recommendations using computer vision.",
                category: "styling_assistant",
                imageUrl: "/virtual_stylist_image.png",
                content: "Case study on building a virtual assistant that understands personal style."
            }
        ];

        for (const study of caseStudies) {
            await ctx.db.insert("case_studies", study);
        }

        // 4. Seed/Update Global App Settings
        const existingSettings = await ctx.db.query("app_settings").filter(q => q.eq(q.field("type"), "global")).first();
        if (existingSettings) {
            await ctx.db.patch(existingSettings._id, {
                apiKeys: {
                    ...existingSettings.apiKeys
                }
            });
        } else {
            await ctx.db.insert("app_settings", {
                type: "global",
                logoUrl: "",
                apiKeys: {
                    gemini: "",
                    instagram: "",
                    twitter: "",
                    twitterBearer: "",
                    twitterConsumerKey: "",
                    twitterConsumerSecret: "",
                    newsdata: "",
                    newsapi: "",
                    gnews: "",
                    worldnews: ""
                },
                defaults: {
                    targetCountries: ["AE", "SA"],
                    aveMultiplier: 0.005
                }
            });
        }

        return "Database seeded successfully!";
    }
});
