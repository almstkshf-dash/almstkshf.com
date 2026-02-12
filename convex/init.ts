import { internalMutation, mutation } from "./_generated/server";

export const seed = mutation({
    handler: async (ctx) => {
        // Clear existing data (optional, but good for clean seeding)
        // const existingReports = await ctx.db.query("media_reports").collect();
        // for (const report of existingReports) {
        //     await ctx.db.delete(report._id);
        // }

        // Seed Media Reports
        const reports = [
            {
                reportName: "Daily Media Monitoring - morning session",
                source: "TV" as const,
                status: "Published" as const,
                timestamp: Date.now() - 3600000,
                summary: "Analysis of prime time news coverage in the Gulf region."
            },
            {
                reportName: "Economic Analysis Report",
                source: "Press" as const,
                status: "Published" as const,
                timestamp: Date.now() - 7200000,
                summary: "Sentiment analysis on recent market policy changes."
            },
            {
                reportName: "Radio Talk Show Summary",
                source: "Radio" as const,
                status: "Draft" as const,
                timestamp: Date.now() - 500000,
                summary: "Compilation of call-in comments regarding public services."
            }
        ];

        for (const report of reports) {
            await ctx.db.insert("media_reports", report);
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

        return "Database seeded successfully!";
    }
});
