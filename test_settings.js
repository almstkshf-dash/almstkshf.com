 
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");

const client = new ConvexHttpClient("https://flexible-anaconda-162.convex.cloud");

async function run() {
    try {
        await client.mutation(api.settings.updateSettings, {
            logoUrl: "",
            brandName: "Almstkshf",
            brandTagline: "Test",
            footerUrl: "test.com",
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
                worldnews: "",
                chatbaseId: "",
                chatbaseHost: "",
                stripePublishableKey: "",
                stripeSecretKey: "",
                stripeWebhookSecret: "",
                diffbot: "",
                zenrows: "",
                similarweb: "",
            },
            defaults: {
                targetCountries: ["AE", "SA"],
                aveMultiplier: 0.005
            }
        });
        console.log("Success!");
    } catch (e) {
        console.error("Error name:", e.name);
        console.error("Error message:", e.message);
        console.error("Error data:", e.data);
    }
}
run();
