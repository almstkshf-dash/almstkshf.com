/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * DEDUPLICATION ENGINE â€” Upstash Redis
 * Convex Actions run in Node.js runtime ("use node").
 * This module uses @upstash/redis directly from process.env.
 *
 * Strategy:
 *  - Hash = SHA-256 of (normalized_url + normalized_title)
 *  - SET key in Redis with EX=86400 (24 hours)
 *  - If key already exists â†’ article is a duplicate â†’ SKIP
 *  - If key is new â†’ article is fresh â†’ PROCEED
 *
 * Redis credentials consumed from environment:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { createHash } from "crypto";

const DEDUP_TTL_SECONDS = 86400; // 24 hours
const DEDUP_KEY_PREFIX = "monitoring:dedup:";

// â”€â”€ Lazy Redis client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// We construct the client lazily to avoid failures at module-load time
// when env vars might not yet be resolved.
function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null; // Dedup silently skipped when Redis is unconfigured
  }

  return { url, token };
}

/**
 * Builds a stable, short dedup key from a URL and title.
 * Normalises the URL (lowercase, strip trailing slash & query params for
 * canonical comparison) before hashing.
 */
function buildDedupHash(url: string, title: string): string {
  const normalizedUrl = url.toLowerCase().split("?")[0].replace(/\/$/, "");
  const normalizedTitle = title.toLowerCase().trim();
  const raw = `${normalizedUrl}::${normalizedTitle}`;
  return createHash("sha256").update(raw).digest("hex").substring(0, 32);
}

/**
 * Performs a Redis SET NX (Set if Not eXists) with a 24-hour TTL.
 *
 * @returns `true`  â†’ article was already seen (DUPLICATE â€” skip it)
 * @returns `false` â†’ article is new (proceed with ingestion)
 */
let hasWarnedMissingRedis = false;

export async function checkAndSetSeen(url: string, title: string): Promise<boolean> {
  const client = getRedisClient();

  if (!client) {
    // Redis not configured â€” allow all articles through (no dedup)
    if (!hasWarnedMissingRedis) {
      console.warn("âš ï¸ Dedup: UPSTASH_REDIS_REST_URL/TOKEN not set. Deduplication disabled.");
      hasWarnedMissingRedis = true;
    }
    return false;
  }

  const hash = buildDedupHash(url, title);
  const key = `${DEDUP_KEY_PREFIX}${hash}`;

  try {
    // Upstash REST API â€” SET key value NX EX ttl
    // Returns "OK" if set (new), null if already exists (duplicate)
    const res = await fetch(`${client.url}/set/${encodeURIComponent(key)}/1/NX/EX/${DEDUP_TTL_SECONDS}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${client.token}`,
      },
    });

    if (!res.ok) {
      console.warn(`âš ï¸ Dedup Redis error: HTTP ${res.status}`);
      return false; // Fail-open: allow articles through on Redis errors
    }

    const data = await res.json() as { result: string | null };
    const isNew = data.result === "OK";

    if (!isNew) {
      console.log(`ðŸ—‘ï¸ Dedup skip: "${title.substring(0, 60)}..." (seen within 24h)`);
    }

    return !isNew; // Return true â†’ duplicate (skip), false â†’ new (proceed)
  } catch (error) {
    console.warn("âš ï¸ Dedup Redis request failed:", error);
    return false; // Fail-open on network errors
  }
}

/**
 * Batch-check: returns a Set of indices that are duplicates.
 * Useful for future batch optimisation (not used in current pipeline).
 */
export async function batchCheckSeen(
  items: Array<{ url: string; title: string }>
): Promise<Set<number>> {
  const duplicateIndices = new Set<number>();
  // Sequential for now â€” could be optimised with Redis pipeline/MGET
  for (let i = 0; i < items.length; i++) {
    const isDuplicate = await checkAndSetSeen(items[i].url, items[i].title);
    if (isDuplicate) duplicateIndices.add(i);
  }
  return duplicateIndices;
}
