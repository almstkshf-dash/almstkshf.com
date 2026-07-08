/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface Integration {
    id: string;
    icon: string;
    active: boolean;
}

export interface UserIntegration {
    id: string;
    name: string;
    description: string;
    status: "connected" | "disconnected";
    apiKey?: string;
}
