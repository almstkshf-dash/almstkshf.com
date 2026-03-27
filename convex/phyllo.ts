import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getOrCreatePhylloUser = action({
    args: {},
    handler: async (ctx): Promise<string> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        // Check if user already has a Phyllo ID
        const userSettings = await ctx.runQuery(api.phyllo.getUserSettings, { userId });
        if (userSettings?.phylloUserId) {
            return userSettings.phylloUserId;
        }

        // Get Phyllo credentials
        const settings = await ctx.runQuery(api.settings.getSettings);
        const clientId = settings?.apiKeys?.phylloClientId;
        const clientSecret = settings?.apiKeys?.phylloClientSecret;

        if (!clientId || !clientSecret) {
            throw new Error("Phyllo credentials not configured. Please add them in the Settings page.");
        }

        // Phyllo Basic Auth
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        // Create Phyllo User
        const response = await fetch("https://api.staging.getphyllo.com/v1/users", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: identity.name || "ALMSTKSHF User",
                external_id: userId
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Phyllo User Creation Failed:", err);
            throw new Error("Failed to create Phyllo user: " + err);
        }

        const phylloUser = await response.json();
        const phylloUserId = phylloUser.id;

        // Save to user_settings
        await ctx.runMutation(api.phyllo.updatePhylloUserId, { userId, phylloUserId });

        return phylloUserId;
    }
});

export const getPhylloToken = action({
    args: { phylloUserId: v.string() },
    handler: async (ctx, args): Promise<string> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const settings = await ctx.runQuery(api.settings.getSettings);
        const clientId = settings?.apiKeys?.phylloClientId;
        const clientSecret = settings?.apiKeys?.phylloClientSecret;

        if (!clientId || !clientSecret) {
            throw new Error("Phyllo credentials not configured.");
        }

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await fetch("https://api.staging.getphyllo.com/v1/sdk-tokens", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: args.phylloUserId,
                products: ["IDENTITY", "IDENTITY.AUDIENCE", "ENGAGEMENT", "ENGAGEMENT.AUDIENCE", "INCOME", "ACTIVITY"]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Phyllo Token Creation Failed:", err);
            throw new Error("Failed to create Phyllo token: " + err);
        }

        const data = await response.json();
        return data.token;
    }
});

export const getUserSettings = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("user_settings")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();
    }
});

export const updatePhylloUserId = mutation({
    args: { userId: v.string(), phylloUserId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("user_settings")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { phylloUserId: args.phylloUserId });
        } else {
            await ctx.db.insert("user_settings", {
                userId: args.userId,
                kycStatus: "Pending",
                phylloUserId: args.phylloUserId
            });
        }
    }
});
