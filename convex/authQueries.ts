/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query } from "./_generated/server";
import { isAdmin } from "./utils/auth";

/**
 * Exposes whether the currently authenticated user has admin privileges.
 * Used by frontend components to conditionally show admin-only UI.
 * Safe to call from any authenticated or unauthenticated context â€” returns false if no session.
 */
export const checkIsAdmin = query({
    args: {},
    handler: async (ctx) => {
        return await isAdmin(ctx.auth);
    },
});
