/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * ═════════════════════════════════════════════════════════════════════
 * Next.js-side Deduplication Bridge — Upstash Redis
 *
 * Mirrors the exact same hashing and SET NX logic used by the Convex
 * dedup engine (convex/utils/dedup.ts) so that articles ingested via
 * Vercel cron routes and articles ingested via Convex actions share
 * the same Redis key space. This prevents duplicate articles between
 * the two ingestion paths.
 *
 * Uses the @upstash/redis SDK (already available in Next.js runtime)
 * via the shared client from src/lib/redis.ts.
 * ═════════════════════════════════════════════════════════════════════
 */

import { getRedis } from '@/lib/redis';

const DEDUP_TTL_SECONDS = 86400; // 24 hours — must match convex/utils/dedup.ts
const DEDUP_KEY_PREFIX = "monitoring:dedup:"; // must match convex/utils/dedup.ts

/**
 * Builds a stable, short dedup key from a URL and title.
 * MUST produce the same hash as convex/utils/dedup.ts buildDedupHash().
 */
async function buildDedupHash(url: string, title: string): Promise<string> {
  const normalizedUrl = url.toLowerCase().split("?")[0].replace(/\/$/, "");
  const normalizedTitle = title.toLowerCase().trim();
  const raw = `${normalizedUrl}::${normalizedTitle}`;
  const data = new TextEncoder().encode(raw);
  // crypto.subtle is available in Node.js 18+ (Next.js runtime)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

let hasWarned = false;

/**
 * Check-and-set: records an article in Redis dedup and returns whether
 * it was already seen.
 *
 * @returns `true`  → article was already seen (DUPLICATE — skip it)
 * @returns `false` → article is new (proceed with ingestion)
 */
export async function checkAndSetSeenNextjs(url: string, title: string): Promise<boolean> {
  const redis = getRedis();

  if (!redis) {
    if (!hasWarned) {
      console.warn("⚠️ Next.js Dedup: Upstash Redis not configured. Deduplication disabled.");
      hasWarned = true;
    }
    return false;
  }

  const hash = await buildDedupHash(url, title);
  const key = `${DEDUP_KEY_PREFIX}${hash}`;

  try {
    // SET key value NX EX ttl — returns "OK" if new, null if exists
    const result = await redis.set(key, "1", { nx: true, ex: DEDUP_TTL_SECONDS });
    const isNew = result === "OK";

    if (!isNew) {
      console.log(`🗑️ Next.js Dedup skip: "${title.substring(0, 60)}..." (seen within 24h)`);
    }

    return !isNew;
  } catch (error) {
    console.warn("⚠️ Next.js Dedup Redis request failed:", error);
    return false; // Fail-open
  }
}
