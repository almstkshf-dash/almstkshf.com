/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendSubscriptionEmail = action({
    args: {
        to: v.string(),
        subject: v.string(),
        userName: v.string(),
        planName: v.string(),
        type: v.union(v.literal("activation"), v.literal("renewal"), v.literal("expiration_warning")),
    },
    handler: async (ctx, args) => {
        let content = "";

        if (args.type === "activation") {
            content = `Hi ${args.userName},\n\nYour subscription to the ${args.planName} plan has been activated! You now have full access to our OSINT Engine, AI Inspector, and monitoring tools.\n\nEnjoy exploring!`;
        } else if (args.type === "renewal") {
            content = `Hi ${args.userName},\n\nYour subscription to the ${args.planName} plan has been successfully renewed.\n\nThank you for staying with us!`;
        } else if (args.type === "expiration_warning") {
            content = `Hi ${args.userName},\n\nYour subscription to the ${args.planName} plan is expiring soon. Please renew now to avoid any interruption in your media monitoring and OSINT services.`;
        }

        try {
            await resend.emails.send({
                from: "Almstkshf <notifications@almstkshf.com>",
                to: args.to,
                subject: args.subject,
                text: content,
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to send email via Resend:", error);
            return { success: false, error: String(error) };
        }
    },
});
