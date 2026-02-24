import { getRedis } from '@/lib/upstash';

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
}

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    try {
        const redis = getRedis();
        if (!redis) {
            return { allowed: true, remaining: limit, resetSeconds: windowSeconds };
        }

        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, windowSeconds);
        }
        const remaining = Math.max(0, limit - count);
        return { allowed: count <= limit, remaining, resetSeconds: windowSeconds };
    } catch {
        return { allowed: true, remaining: limit, resetSeconds: windowSeconds };
    }
}
