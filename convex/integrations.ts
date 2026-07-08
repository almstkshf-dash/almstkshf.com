/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query } from "./_generated/server";

/**
 * Returns available integrations catalog metadata (non-localized configuration only).
 * Localization is handled by next-intl on the client.
 */
export const getAvailable = query({
    args: {},
    handler: async (ctx) => {
        return [
            {
                id: "slack",
                icon: "Slack",
                active: true,
            },
            {
                id: "webhooks",
                icon: "Webhook",
                active: true,
            },
            {
                id: "crm",
                icon: "Database",
                active: true,
            },
            {
                id: "teams",
                icon: "Users",
                active: true,
            },
            {
                id: "email",
                icon: "Mail",
                active: true,
            }
        ];
    },
});

/**
 * Returns mock user connected integrations with pre-masked API keys.
 * Exposing real keys to client bundles is a security risk.
 */
export const getUserIntegrations = query({
    args: {},
    handler: async (ctx) => {
        return [
            {
                id: "1",
                name: "Media Pulse API",
                description: "Connect to live sentiment data streams.",
                status: "connected",
                apiKey: "mk_live_••••••••••••••••"
            },
            {
                id: "2",
                name: "LEXCORA Suite",
                description: "Legal ERP and document processing engine integration.",
                status: "connected",
                apiKey: "lc_prod_••••••••••••••••"
            },
            {
                id: "3",
                name: "Strategic Advisor Webhooks",
                description: "Trigger events based on AI insights.",
                status: "disconnected"
            },
        ];
    },
});
