/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Redis } from '@upstash/redis';

let cachedRedis: Redis | null = null;

function getRedisClient(): Redis | null {
    if (cachedRedis) return cachedRedis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn('Upstash Redis is not configured. Rate limiting will be disabled.');
        return null;
    }

    cachedRedis = new Redis({ url, token });
    return cachedRedis;
}

export function getRedis() {
    return getRedisClient();
}
