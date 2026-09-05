/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { getRedis } from '@/lib/redis';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
}

// In-memory fallback for rate limiting when Redis is unavailable (dev only)
const inMemoryStore = new Map<string, { count: number; expiresAt: number }>();

function cleanInMemoryStore() {
    const now = Date.now();
    for (const [key, value] of inMemoryStore.entries()) {
        if (now >= value.expiresAt) {
            inMemoryStore.delete(key);
        }
    }
}

function runInMemoryRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
    const now = Date.now();
    
    // Periodically clean up expired keys (5% chance per call to avoid bloat)
    if (Math.random() < 0.05) {
        cleanInMemoryStore();
    }

    const record = inMemoryStore.get(key);
    if (!record || now >= record.expiresAt) {
        inMemoryStore.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
        return { allowed: true, remaining: limit - 1, resetSeconds: windowSeconds };
    }

    record.count++;
    const remaining = Math.max(0, limit - record.count);
    const resetSeconds = Math.max(0, Math.ceil((record.expiresAt - now) / 1000));
    return {
        allowed: record.count <= limit,
        remaining,
        resetSeconds
    };
}

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    try {
        const redis = getRedis();
        if (!redis) {
            if (process.env.NODE_ENV !== 'production') {
                return runInMemoryRateLimit(key, limit, windowSeconds);
            }
            // Fail open in production if Redis connection is not configured (to avoid downtime)
            return { allowed: true, remaining: limit, resetSeconds: 0 };
        }

        // Atomic Lua script to INCR and EXPIRE in a single round-trip
        const script = `
            local current = redis.call("INCR", KEYS[1])
            if current == 1 then
                redis.call("EXPIRE", KEYS[1], ARGV[1])
            end
            return current
        `;

        const count = await redis.eval<number[], number>(script, [key], [windowSeconds]);
        const remaining = Math.max(0, limit - count);
        return { allowed: count <= limit, remaining, resetSeconds: windowSeconds };
    } catch (error) {
        console.warn(`Upstash Redis rate limiting failed, falling back:`, error);
        if (process.env.NODE_ENV !== 'production') {
            return runInMemoryRateLimit(key, limit, windowSeconds);
        }
        // Fail open in production on Redis failure
        return { allowed: true, remaining: limit, resetSeconds: 0 };
    }
}

function getSafeClientIp(headersInstance: Headers): string {
    const isDev = process.env.NODE_ENV !== 'production';
    return (
        headersInstance.get('cf-connecting-ip') ||
        headersInstance.get('x-real-ip') ||
        headersInstance.get('true-client-ip') ||
        headersInstance.get('x-nf-client-connection-ip') ||
        (isDev ? headersInstance.get('x-forwarded-for')?.split(',')[0]?.trim() : null) ||
        'unknown'
    );
}

export async function getRateLimitKey(
    req: Request | NextRequest | null | undefined,
    prefix: string,
    userId?: string | null
): Promise<string> {
    if (!userId) {
        try {
            // Retrieve Clerk authentication data dynamically only if needed on the server
            const { auth } = await import('@clerk/nextjs/server');
            const authData = await auth();
            userId = authData?.userId || null;
        } catch {
            // auth() might fail if not executed within an active Next.js request context (e.g. edge environments or testing)
        }
    }

    if (userId) {
        return `${prefix}:user:${userId}`;
    }

    // Resolve Client IP securely from headers
    let ip: string | null = null;
    if (req) {
        if ('ip' in req && req.ip) {
            ip = req.ip as string;
        } else {
            ip = getSafeClientIp(req.headers);
        }
    } else {
        try {
            const reqHeaders = await headers();
            ip = getSafeClientIp(reqHeaders);
        } catch {
            // fallback if headers() fails (e.g. outside next.js request context entirely)
        }
    }

    return `${prefix}:ip:${ip || 'unknown'}`;
}
