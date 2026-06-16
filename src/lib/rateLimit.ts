/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { getRedis } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
}

// In-memory fallback for rate limiting when Redis is unavailable
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
            return runInMemoryRateLimit(key, limit, windowSeconds);
        }

        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, windowSeconds);
        }
        const remaining = Math.max(0, limit - count);
        return { allowed: count <= limit, remaining, resetSeconds: windowSeconds };
    } catch (error) {
        console.warn(`Upstash Redis rate limiting failed, falling back to in-memory:`, error);
        return runInMemoryRateLimit(key, limit, windowSeconds);
    }
}

export async function getRateLimitKey(req: Request | NextRequest, prefix: string, userId?: string | null): Promise<string> {
    if (!userId) {
        try {
            // Retrieve Clerk authentication data to restrict rate limiting by User ID
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
    if ('ip' in req && req.ip) {
        ip = req.ip as string;
    } else {
        const headers = req.headers;
        ip = headers.get('cf-connecting-ip') ||
             headers.get('x-real-ip') ||
             headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             null;
    }

    return `${prefix}:ip:${ip || 'unknown'}`;
}
