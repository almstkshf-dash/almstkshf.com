import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        // Store in database
        const submissionId = await ctx.db.insert("contact_submissions", {
            ...args,
            timestamp: Date.now(),
        });

        // Send email notification using Resend
        try {
            const RESEND_API_KEY = process.env.RESEND_API_KEY;
            const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "k.account@almstkshf.com";

            if (RESEND_API_KEY) {
                const response = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: "ALMSTKSHF Contact Form <onboarding@resend.dev>",
                        to: [CONTACT_EMAIL],
                        reply_to: args.email,
                        subject: `New Contact Form Submission: ${args.subject}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
                                    New Contact Form Submission
                                </h2>
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 10px 0;"><strong>Name:</strong> ${args.name}</p>
                                    <p style="margin: 10px 0;"><strong>Email:</strong> ${args.email}</p>
                                    <p style="margin: 10px 0;"><strong>Subject:</strong> ${args.subject}</p>
                                </div>
                                <div style="margin: 20px 0;">
                                    <h3 style="color: #1e293b;">Message:</h3>
                                    <p style="white-space: pre-wrap; background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                        ${args.message}
                                    </p>
                                </div>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                <p style="color: #64748b; font-size: 12px;">
                                    Submission ID: ${submissionId}<br>
                                    Timestamp: ${new Date().toLocaleString()}
                                </p>
                            </div>
                        `,
                    }),
                });

                if (!response.ok) {
                    console.error("Failed to send email:", await response.text());
                }
            } else {
                console.warn("RESEND_API_KEY not configured. Email notification skipped.");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            // Don't fail the mutation if email fails
        }

        return submissionId;
    },
});
