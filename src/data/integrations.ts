/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Integration } from "@/types/integration";

export const defaultIntegrations: Integration[] = [
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
