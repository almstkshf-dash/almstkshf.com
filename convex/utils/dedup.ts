/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * ═════════════════════════════════════════════════════════════════════
 * DEDUPLICATION ENGINE — Upstash Redis
 * Convex Actions run in Node.js runtime ("use node").
 * This module uses the Upstash REST API directly via fetch().
 *
 * Strategy:
 *  - Hash = SHA-256 of (normalized_url + normalized_title)
 *  - SET key in Redis with EX=86400 (24 hours)
 *  - If key already exists → article is a duplicate → SKIP
 *  - If key is new → article is fresh → PROCEED
 *
 * Redis credentials consumed from environment:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 * ═════════════════════════════════════════════════════════════════════
 */

export const DEDUP_TTL_SECONDS = 86400; // 24 hours
export const DEDUP_KEY_PREFIX = "monitoring:dedup:";

// —— Lazy Redis client ————————————————————————————————
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
export async function buildDedupHash(url: string, title: string): Promise<string> {
  const normalizedUrl = url.toLowerCase().split("?")[0].replace(/\/$/, "");
  const normalizedTitle = title.toLowerCase().trim();
  const raw = `${normalizedUrl}::${normalizedTitle}`;
  const data = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

/**
 * Performs a Redis SET NX (Set if Not eXists) with a 24-hour TTL.
 *
 * @returns `true`  → article was already seen (DUPLICATE — skip it)
 * @returns `false` → article is new (proceed with ingestion)
 */
let hasWarnedMissingRedis = false;

export async function checkAndSetSeen(url: string, title: string): Promise<boolean> {
  const client = getRedisClient();

  if (!client) {
    // Redis not configured — allow all articles through (no dedup)
    if (!hasWarnedMissingRedis) {
      console.warn("⚠️ Dedup: UPSTASH_REDIS_REST_URL/TOKEN not set. Deduplication disabled.");
      hasWarnedMissingRedis = true;
    }
    return false;
  }

  const hash = await buildDedupHash(url, title);
  const key = `${DEDUP_KEY_PREFIX}${hash}`;

  try {
    // Upstash REST API — SET key value NX EX ttl
    // Returns "OK" if set (new), null if already exists (duplicate)
    const res = await fetch(`${client.url}/set/${encodeURIComponent(key)}/1/NX/EX/${DEDUP_TTL_SECONDS}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${client.token}`,
      },
    });

    if (!res.ok) {
      console.warn(`⚠️ Dedup Redis error: HTTP ${res.status}`);
      return false; // Fail-open: allow articles through on Redis errors
    }

    const data = await res.json() as { result: string | null };
    const isNew = data.result === "OK";

    if (!isNew) {
      console.log(`🗑️ Dedup skip: "${title.substring(0, 60)}..." (seen within 24h)`);
    }

    return !isNew; // Return true → duplicate (skip), false → new (proceed)
  } catch (error) {
    console.warn("⚠️ Dedup Redis request failed:", error);
    return false; // Fail-open on network errors
  }
}

/**
 * Batch-check using the Upstash REST `/pipeline` endpoint.
 * Sends all SET NX commands in a single HTTP request instead of N round-trips.
 *
 * @returns A Set of indices that are duplicates (already seen within 24h).
 */
export async function batchCheckSeen(
  items: Array<{ url: string; title: string }>
): Promise<Set<number>> {
  const duplicateIndices = new Set<number>();
  if (items.length === 0) return duplicateIndices;

  const client = getRedisClient();
  if (!client) {
    if (!hasWarnedMissingRedis) {
      console.warn("⚠️ Dedup: UPSTASH_REDIS_REST_URL/TOKEN not set. Deduplication disabled.");
      hasWarnedMissingRedis = true;
    }
    return duplicateIndices;
  }

  // Pre-compute all hashes in parallel
  const hashes = await Promise.all(
    items.map(item => buildDedupHash(item.url, item.title))
  );

  // Build pipeline: one SET key 1 NX EX 86400 per item
  const pipeline = hashes.map(hash => [
    "SET", `${DEDUP_KEY_PREFIX}${hash}`, "1", "NX", "EX", String(DEDUP_TTL_SECONDS)
  ]);

  try {
    const res = await fetch(`${client.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${client.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) {
      console.warn(`⚠️ Dedup pipeline Redis error: HTTP ${res.status}`);
      return duplicateIndices; // Fail-open
    }

    // Each result is { result: "OK" } for new or { result: null } for duplicate
    const results = await res.json() as Array<{ result: string | null; error?: string }>;
    for (let i = 0; i < results.length; i++) {
      if (results[i].result !== "OK") {
        duplicateIndices.add(i);
        const title = items[i].title;
        console.log(`🗑️ Dedup skip: "${title.substring(0, 60)}..." (seen within 24h)`);
      }
    }
  } catch (error) {
    console.warn("⚠️ Dedup pipeline request failed:", error);
    // Fail-open: return empty set (allow all through)
  }

  return duplicateIndices;
}
