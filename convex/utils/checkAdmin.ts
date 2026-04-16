/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query } from "../_generated/server";
import { requireAdmin } from "./auth";

export const isAdmin = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx.auth);
        return true;
    },
});
