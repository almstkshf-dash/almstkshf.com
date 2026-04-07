"use node";
/**
 * ═══════════════════════════════════════════════════════════════════
 * DEDUPLICATION ENGINE — Upstash Redis
 * Convex Actions run in Node.js runtime ("use node").
 * This module uses @upstash/redis directly from process.env.
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
 * ═══════════════════════════════════════════════════════════════════
 */

import { createHash } from "crypto";

const DEDUP_TTL_SECONDS = 86400; // 24 hours
const DEDUP_KEY_PREFIX = "monitoring:dedup:";

// ── Lazy Redis client ────────────────────────────────────────────────
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

  const hash = buildDedupHash(url, title);
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
 * Batch-check: returns a Set of indices that are duplicates.
 * Useful for future batch optimisation (not used in current pipeline).
 */
export async function batchCheckSeen(
  items: Array<{ url: string; title: string }>
): Promise<Set<number>> {
  const duplicateIndices = new Set<number>();
  // Sequential for now — could be optimised with Redis pipeline/MGET
  for (let i = 0; i < items.length; i++) {
    const isDuplicate = await checkAndSetSeen(items[i].url, items[i].title);
    if (isDuplicate) duplicateIndices.add(i);
  }
  return duplicateIndices;
}
