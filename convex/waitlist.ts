import { mutation } from "./_generated/server";
import { action } from "./_generated/server";
import { v } from "convex/values";

// Mutation to store waitlist entry
export const joinWaitlist = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        service: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate email format
        const email = args.email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            console.error(`❌ Validation failed for email: "${email}"`);
            throw new Error("Invalid email address format. Please check and try again.");
        }

        // Check if already in waitlist for this service
        const existing = await ctx.db
            .query("waitlist")
            .withIndex("by_email", (q) => q.eq("email", email))
            .filter((q) => q.eq(q.field("service"), args.service))
            .first();

        if (existing) {
            // Already registered
            return { success: true, message: "You are already on the list!", alreadyExists: true };
        }

        // Insert into database
        await ctx.db.insert("waitlist", {
            email: email,
            name: args.name,
            service: args.service,
            timestamp: Date.now(),
        });

        return { success: true, message: "Successfully joined the waitlist!", alreadyExists: false };
    },
});

// Action to send waitlist emails
export const sendWaitlistEmails = action({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        service: v.string(),
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "k.account@almstkshf.com";

        if (!RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not configured. Email notifications skipped.");
            return { success: false, error: "API key not configured" };
        }

        try {
            // Send confirmation email to user
            const userEmailResponse = await fetch("https://api.resend.com/emails", {
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

            if (!userEmailResponse.ok) {
                console.error("Failed to send user email:", await userEmailResponse.text());
            }

            // Send notification to admin
            const adminEmailResponse = await fetch("https://api.resend.com/emails", {
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

            if (!adminEmailResponse.ok) {
                console.error("Failed to send admin email:", await adminEmailResponse.text());
            }

            console.log("Waitlist emails sent successfully");
            return { success: true };
        } catch (error) {
            console.error("Error sending waitlist emails:", error);
            return { success: false, error: String(error) };
        }
    },
});
