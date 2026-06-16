/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * SSRF guard: blocks requests to private/loopback networks.
 * Without this, an attacker could pass 169.254.169.254 (AWS/Vercel metadata)
 * or 10.x.x.x addresses to exfiltrate secrets from the server environment.
 */
export function isSafePublicUrl(rawUrl: string): boolean {
  try {
    const { hostname, protocol } = new URL(rawUrl);
    if (protocol !== 'https:') return false;
    // Block loopback, link-local, and RFC-1918 private ranges
    const blocked = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^169\.254\./,
      /^::1$/,
    ];
    return !blocked.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}
