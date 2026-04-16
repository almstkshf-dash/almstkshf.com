/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export async function sendResendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
}) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured. Email skipped.");
        return { success: false, error: "API key not configured" };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "ALMSTKSHF System <onboarding@resend.dev>",
                to: Array.isArray(options.to) ? options.to : [options.to],
                reply_to: options.replyTo,
                subject: options.subject,
                html: options.html,
            }),
        });

        const responseData = await response.text();

        if (!response.ok) {
            const errorMsg = responseData;
            try {
                const errorData = JSON.parse(responseData);
                if (errorData.name === "validation_error" && errorData.message.includes("testing emails")) {
                    console.error("âŒ RESEND ERROR: You are in testing mode. You can ONLY send emails to the email address associated with your Resend account.");
                }
            } catch { /* ignore parse error */ }

            console.error("Failed to send email:", responseData);
            return { success: false, error: errorMsg };
        }

        console.log("Email sent successfully.");
        return { success: true, data: responseData };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: String(error) };
    }
}
