import { serve } from "@workflow/next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const { POST } = serve({
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
    workflows: {
        // A robust media monitoring workflow
        monitoring: async (step) => {
            // 1. Get configuration
            const config = await step.run("get-monitoring-config", async () => {
                // This could come from a database or initial payload
                return {
                    keyword: "Artificial Intelligence",
                    countries: "AE,SA",
                    languages: "en,ar"
                };
            });

            // 2. Trigger the Raw Fetch (Durable Step)
            // Note: We call the existing Convex Action for the heavy lifting
            const fetchResult = await step.run("fetch-items-from-google-news", async () => {
                // We'll call the existing fetchNews but maybe for a smaller set or as a start
                // In a full refactor, the loop would move here
                const result = await convex.action(api.monitoringAction.fetchNews, {
                    keyword: config.keyword,
                    countries: config.countries,
                    languages: config.languages,
                });
                return result;
            });

            // 3. Optional: Perform a follow-up step like sending a summary email
            // This step only runs if Step 2 succeeds
            if (fetchResult.success) {
                await step.run("notify-completion", async () => {
                    console.log(`Successfully processed ${fetchResult.count} articles for ${config.keyword}`);
                    // Integration with Resend or simple log
                    return { success: true };
                });
            }

            return {
                status: fetchResult.success ? "completed" : "failed",
                count: fetchResult.count
            };
        },
    },
});
