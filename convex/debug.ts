/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { query } from "./_generated/server";

export const debugListAllKeys = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("userSettings").collect();
        return all.map(s => ({
            userId: s.userId,
            isSubscribed: s.isSubscribed,
            geminiKeyMasked: s.geminiApiKey ? `${s.geminiApiKey.substring(0, 4)}...${s.geminiApiKey.substring(s.geminiApiKey.length - 4)}` : "missing"
        }));
    }
});
