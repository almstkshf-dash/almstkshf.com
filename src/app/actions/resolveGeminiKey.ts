/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use server';

import { resolveGeminiKey as resolve } from "@/lib/gemini-key-resolver";

/**
 * Server Action to resolve the Gemini Key.
 * Useful for client-side components to check if they have access.
 */
export async function resolveGeminiKey() {
    return await resolve();
}
