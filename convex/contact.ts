/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { mutation } from "./_generated/server";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { sendResendEmail } from "./utils/email";

// Mutation to store the contact submission
export const submit = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            const submissionId = await ctx.db.insert("contact_submissions", {
                ...args,
                timestamp: Date.now(),
            });

            return { success: true, submissionId };
        } catch (error) {
            console.error("Contact submission error:", error);
            return { success: false, error: "Failed to store message." };
        }
    },
});

// Action to send email notification
export const sendContactEmail = action({
    args: {
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        message: v.string(),
        submissionId: v.string(),
    },
    handler: async (ctx, args) => {
        const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "k.account@almstkshf.com";

        return await sendResendEmail({
            to: CONTACT_EMAIL,
            replyTo: args.email,
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
                        Submission ID: ${args.submissionId}<br>
                        Timestamp: ${new Date().toLocaleString()}
                    </p>
                </div>
            `
        });
    },
});
