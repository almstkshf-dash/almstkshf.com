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

        // Insert into database
        await ctx.db.insert("waitlist", {
            email: args.email,
            name: args.name,
            service: args.service,
            timestamp: Date.now(),
        });

        // Send email notifications using Resend
        try {
            const RESEND_API_KEY = process.env.RESEND_API_KEY;
            const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "k.account@almstkshf.com";

            if (RESEND_API_KEY) {
                // Send confirmation email to user
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: "ALMSTKSHF <onboarding@resend.dev>",
                        to: [args.email],
                        subject: `Welcome to ${args.service} Waitlist!`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
                                    You're on the Waitlist! 🎉
                                </h2>
                                <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                                    Hi ${args.name || "there"},
                                </p>
                                <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                                    Thank you for joining the waitlist for <strong>${args.service}</strong>!
                                </p>
                                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                                    <p style="margin: 0; color: #1e40af;">
                                        We'll notify you as soon as this service becomes available.
                                    </p>
                                </div>
                                <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                                    In the meantime, feel free to explore our other services at 
                                    <a href="https://almstkshf.com" style="color: #3b82f6; text-decoration: none;">almstkshf.com</a>
                                </p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                                <p style="color: #64748b; font-size: 12px;">
                                    Best regards,<br>
                                    The ALMSTKSHF Team
                                </p>
                            </div>
                        `,
                    }),
                });

                // Send notification to admin
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: "ALMSTKSHF Waitlist <onboarding@resend.dev>",
                        to: [CONTACT_EMAIL],
                        subject: `New Waitlist Signup: ${args.service}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
                                    New Waitlist Signup
                                </h2>
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 10px 0;"><strong>Service:</strong> ${args.service}</p>
                                    <p style="margin: 10px 0;"><strong>Name:</strong> ${args.name || "Not provided"}</p>
                                    <p style="margin: 10px 0;"><strong>Email:</strong> ${args.email}</p>
                                    <p style="margin: 10px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                                </div>
                            </div>
                        `,
                    }),
                });
            } else {
                console.warn("RESEND_API_KEY not configured. Email notifications skipped.");
            }
        } catch (error) {
            console.error("Error sending waitlist emails:", error);
            // Don't fail the mutation if email fails
        }

        return { success: true, message: "Successfully joined the waitlist!" };
    },
});
