import { Search } from '@upstash/search';
import { Redis } from '@upstash/redis';

let cachedSearch: Search | null = null;
let cachedRedis: Redis | null = null;

function getSearchClient(): Search {
    if (cachedSearch) return cachedSearch;

    const url = process.env.UPSTASH_SEARCH_REST_URL;
    const token = process.env.UPSTASH_SEARCH_REST_TOKEN;

    if (!url || !token) {
        throw new Error('Upstash Search is not configured.');
    }

    cachedSearch = new Search({ url, token });
    return cachedSearch;
}

function getRedisClient(): Redis {
    if (cachedRedis) return cachedRedis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error('Upstash Redis is not configured.');
    }

    cachedRedis = new Redis({ url, token });
    return cachedRedis;
}

/**
 * Perform a search across a specific index.
 */
export async function performSearch(indexName: string, query: string, options = {}) {
    try {
        const index = getSearchClient().index(indexName);
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
