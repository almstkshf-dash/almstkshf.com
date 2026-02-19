import { Search } from '@upstash/search';
import { Redis } from '@upstash/redis';

// Initialize Search Client
// Note: We use process.env here which works in both Edge and Node runtimes
export const searchClient = new Search({
    url: process.env.UPSTASH_SEARCH_REST_URL || 'https://placeholder.upstash.io',
    token: process.env.UPSTASH_SEARCH_REST_TOKEN || 'placeholder',
});

// Initialize Redis Client (For Rate Limiting or Caching)
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder',
});

/**
 * Perform a search across a specific index.
 */
export async function performSearch(indexName: string, query: string, options = {}) {
    try {
        const index = searchClient.index(indexName);
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
