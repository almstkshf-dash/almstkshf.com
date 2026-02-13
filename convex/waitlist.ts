import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const joinWaitlist = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        service: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address.");
        }

        // Check if already in waitlist for this service
        const existing = await ctx.db
            .query("waitlist")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .filter((q) => q.eq(q.field("service"), args.service))
            .first();

        if (existing) {
            // Already registered - we can just update timestamp or notify
            return { success: true, message: "You are already on the list!" };
        }

        await ctx.db.insert("waitlist", {
            email: args.email,
            name: args.name,
            service: args.service,
            timestamp: Date.now(),
        });

        return { success: true, message: "Successfully joined the waitlist!" };
    },
});
