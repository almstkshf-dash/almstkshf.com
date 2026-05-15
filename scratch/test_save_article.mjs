import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function test() {
    try {
        await client.mutation("monitoring:saveArticle", {
            keyword: "Test",
            url: "http://test.com",
            publishedDate: "15/05/2026",
            title: "Test",
            content: "Test content",
            language: "EN",
            sentiment: "Positive",
            sourceType: "Online News",
            sourceCountry: "US",
            reach: 50000,
            ave: 1250,
        });
        console.log("Success!");
    } catch (e) {
        console.error("Failed:", e.message);
        console.error(e.data);
    }
}
test();
