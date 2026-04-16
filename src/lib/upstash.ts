/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { Search } from '@upstash/search';
import { Redis } from '@upstash/redis';

let cachedSearch: Search | null = null;
let cachedRedis: Redis | null = null;

function getSearchClient(): Search | null {
    if (cachedSearch) return cachedSearch;

    const url = process.env.UPSTASH_SEARCH_REST_URL;
    const token = process.env.UPSTASH_SEARCH_REST_TOKEN;

    if (!url || !token) {
        console.warn('Upstash Search is not configured. Search features will be limited.');
        return null;
    }

    cachedSearch = new Search({ url, token });
    return cachedSearch;
}

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

/**
 * Perform a search across a specific index.
 */
export async function performSearch(indexName: string, query: string, options = {}) {
    try {
        const client = getSearchClient();
        if (!client) return { results: [] }; // Return empty result if not configured

        const index = client.index(indexName);
        const result = await index.search({
            query,
            ...options
        });
        return result;
    } catch (error) {
        console.error(`Upstash Search Error [${indexName}]:`, error);
        throw error;
    }
}

export function getRedis() {
    return getRedisClient();
}
