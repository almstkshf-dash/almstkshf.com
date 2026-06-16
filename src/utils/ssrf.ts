/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * Centralised SSRF guard.
 *
 * Blocks any URL that:
 *   - Uses a non-HTTPS/HTTP protocol
 *   - Resolves to a loopback, link-local, or RFC-1918 private address
 *   - Resolves to any other reserved/special-purpose address range
 *   - Is a well-known internal hostname (localhost, .local, .internal, etc.)
 *
 * DNS Rebinding defence: the guard performs a DNS lookup so the resolved IP
 * is validated before the caller issues the real fetch.  The caller MUST use
 * `redirect: 'manual'` and re-validate every Location header with this guard
 * to prevent rebinding across hops.
 */

import { isIP } from 'net';
import dns from 'dns/promises';

// ---------------------------------------------------------------------------
// IPv4 blocked ranges (RFC 1918, RFC 5737, RFC 6598, and others)
// ---------------------------------------------------------------------------
const BLOCKED_IPV4: RegExp[] = [
  /^0\./,                                  // 0.0.0.0/8      — "This" network
  /^10\./,                                 // 10.0.0.0/8     — RFC 1918 private
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10 — CGNAT (RFC 6598)
  /^127\./,                                // 127.0.0.0/8    — Loopback
  /^169\.254\./,                           // 169.254.0.0/16 — Link-local / AWS metadata
  /^172\.(1[6-9]|2\d|3[0-1])\./,          // 172.16.0.0/12  — RFC 1918 private
  /^192\.0\.0\./,                          // 192.0.0.0/24   — IETF Protocol Assignments
  /^192\.0\.2\./,                          // 192.0.2.0/24   — TEST-NET-1 (RFC 5737)
  /^192\.88\.99\./,                        // 192.88.99.0/24 — 6to4 Relay Anycast (RFC 3068)
  /^192\.168\./,                           // 192.168.0.0/16 — RFC 1918 private
  /^198\.18\./,                            // 198.18.0.0/15  — Benchmarking (RFC 2544)
  /^198\.19\./,                            // 198.19.0.0/15  — Benchmarking (RFC 2544)
  /^198\.51\.100\./,                       // 198.51.100.0/24— TEST-NET-2 (RFC 5737)
  /^203\.0\.113\./,                        // 203.0.113.0/24 — TEST-NET-3 (RFC 5737)
  /^2(2[4-9]|[3-4]\d|5[0-5])\./,          // 224.0.0.0/4    — Multicast
  /^24[0-9]\./,                            // 240.0.0.0/4    — Reserved / Future use
  /^25[0-5]\./,                            // 255.x.x.x      — Broadcast
];

// ---------------------------------------------------------------------------
// IPv6 blocked ranges
// ---------------------------------------------------------------------------
const BLOCKED_IPV6: RegExp[] = [
  /^::$/,                                  // Unspecified
  /^::1$/i,                                // Loopback
  /^::ffff:/i,                             // IPv4-mapped (::ffff:127.0.0.1, etc.)
  /^64:ff9b::/i,                           // IPv4/IPv6 translation (RFC 6052)
  /^100::/i,                               // Discard prefix (RFC 6666)
  /^2001::/i,                              // Teredo tunnelling
  /^2001:db8:/i,                           // Documentation (RFC 3849)
  /^2002:/i,                               // 6to4
  /^fc[0-9a-f]{2}:/i,                      // Unique local (RFC 4193) — fc00::/7
  /^fd[0-9a-f]{2}:/i,                      // Unique local (RFC 4193) — fc00::/7
  /^fe[8-9a-f][0-9a-f]:/i,                 // Link-local (fe80::/10) & Site-local (fec0::/10)
  /^ff[0-9a-f]{2}:/i,                      // Multicast
];

// ---------------------------------------------------------------------------
// Blocked hostnames / TLD patterns
// ---------------------------------------------------------------------------
const BLOCKED_HOSTNAMES: RegExp[] = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.localhost$/i,
  /\.example(\.com|\.net|\.org)?$/i,
  /\.invalid$/i,
  /\.test$/i,
];

function isBlockedIp(ip: string): boolean {
  if (ip.includes(':')) {
    // IPv6
    return BLOCKED_IPV6.some((re) => re.test(ip));
  }
  // IPv4
  return BLOCKED_IPV4.some((re) => re.test(ip));
}

/**
 * Returns `true` when the hostname should be blocked regardless of DNS.
 */
function isBlockedHostname(hostname: string): boolean {
  return BLOCKED_HOSTNAMES.some((re) => re.test(hostname));
}

/**
 * Resolves `hostname` via DNS and returns `true` if **any** returned address
 * falls into a blocked range.  On resolution failure the hostname is blocked
 * conservatively.
 */
async function isDnsResolutionBlocked(hostname: string): Promise<boolean> {
  // If the hostname itself is a literal IP we can skip DNS.
  if (isIP(hostname)) {
    return isBlockedIp(hostname);
  }

  try {
    const results = await dns.lookup(hostname, { all: true });
    return results.some((entry) => isBlockedIp(entry.address));
  } catch {
    // Conservative: block on resolution failure (NXDOMAIN, timeout, etc.)
    return true;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SsrfCheckOptions {
  /**
   * When `true`, both `http:` and `https:` are accepted.
   * When `false` (default), only `https:` is accepted.
   * Set to `true` only for internal tooling that already enforces TLS elsewhere.
   */
  allowHttp?: boolean;
}

/**
 * Full async SSRF guard with DNS resolution.
 *
 * Use this in server-side code that performs outbound HTTP requests on behalf
 * of user-supplied URLs (link resolvers, RSS fetchers, proxy endpoints, etc.).
 *
 * @returns `true` when the URL is safe to fetch, `false` otherwise.
 *
 * @example
 * ```ts
 * if (!(await isSafeUrl(url))) {
 *   return Response.json({ error: 'Blocked URL' }, { status: 400 });
 * }
 * ```
 */
export async function isSafeUrl(
  rawUrl: string,
  options: SsrfCheckOptions = {}
): Promise<boolean> {
  try {
    const { hostname, protocol } = new URL(rawUrl);

    // Protocol whitelist
    const allowedProtocols = options.allowHttp
      ? ['http:', 'https:']
      : ['https:'];
    if (!allowedProtocols.includes(protocol)) return false;

    // Static hostname blocklist
    if (isBlockedHostname(hostname)) return false;

    // DNS-backed IP blocklist (also covers literal IPs)
    if (await isDnsResolutionBlocked(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Synchronous, DNS-free SSRF guard.
 *
 * Suitable only when `rawUrl` is guaranteed to contain a **literal IP** or a
 * well-known hostname, or when you cannot use async code.  Prefer `isSafeUrl`
 * for the general case.
 *
 * @returns `true` when the URL is safe, `false` otherwise.
 * @deprecated Use the async `isSafeUrl` to perform DNS-backed resolution checks.
 */
export function isSafePublicUrl(rawUrl: string): boolean {
  try {
    const { hostname, protocol } = new URL(rawUrl);

    if (protocol !== 'https:') return false;
    if (isBlockedHostname(hostname)) return false;

    // Only reliable for literal IPs; for hostnames this is best-effort.
    if (isIP(hostname)) {
      return !isBlockedIp(hostname);
    }

    return true;
  } catch {
    return false;
  }
}
