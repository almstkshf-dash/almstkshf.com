/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";

import ipaddr from "ipaddr.js";
import { Agent } from "undici";
import dns from "dns";

const UNSAFE_HOSTNAMES = /^(localhost|.*\.local|.*\.internal|.*\.localdomain|metadata\.google\.internal|metadata|instance-data)$/i;

/**
 * Checks if an IP address belongs to a private, loopback, or reserved range.
 * Supports both IPv4 and IPv6 (including IPv4-mapped IPv6 addresses).
 */
export function isPrivateIp(ip: string): boolean {
    try {
        let addr = ipaddr.parse(ip);

        // Unmap IPv4-mapped IPv6 address (e.g. ::ffff:192.168.1.1) to IPv4
        if (addr.kind() === "ipv6" && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
            addr = (addr as ipaddr.IPv6).toIPv4Address();
        }

        const range = addr.range();
        const blockedRanges = [
            "loopback",
            "private",
            "linkLocal",
            "uniqueLocal", // fc00::/7 ULA
            "carrierGradeNat",
            "broadcast",
            "multicast",
            "unspecified",
            "reserved"
        ];

        return blockedRanges.includes(range);
    } catch {
        // Fail-closed for malformed IP strings
        return true;
    }
}

/**
 * Check if the hostname matches any blacklisted local/internal names.
 */
export async function isUnsafeHostname(hostname: string): Promise<boolean> {
    const lowered = hostname.toLowerCase();
    if (UNSAFE_HOSTNAMES.test(lowered)) {
        return true;
    }

    const { isIP } = await import("net");
    if (isIP(hostname)) {
        return isPrivateIp(hostname);
    }

    // Resolve DNS (first pass check)
    const dnsPromises = await import("dns/promises");
    try {
        const results = await dnsPromises.lookup(hostname, { all: true });
        return results.some((entry) => isPrivateIp(entry.address));
    } catch {
        return true; // Fail-closed: unresolvable => unsafe
    }
}

/**
 * Validates a parsed URL for SSRF protections:
 * - Restricts protocol to http: and https:
 * - Rejects URLs with embedded credentials (username/password)
 * - Restricts port to standard 80 and 443
 */
export function validateUrlOptions(url: URL): void {
    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error(`SSRF Blocked: Unsafe protocol: ${url.protocol}`);
    }

    if (url.username || url.password) {
        throw new Error("SSRF Blocked: URL credentials are not permitted.");
    }

    if (url.port && url.port !== "80" && url.port !== "443") {
        throw new Error(`SSRF Blocked: Connection to port ${url.port} is restricted.`);
    }
}

/**
 * Returns a custom Undici Agent that hooks DNS lookup.
 * Pins the resolved IP address to prevent DNS rebinding attacks.
 */
export function getSsrfAgent(dnsCache?: Map<string, string[]>): Agent {
    return new Agent({
        connect: {
            lookup: (hostname, options, callback) => {
                // If DNS cache is provided and contains the hostname, reuse resolved IPs
                if (dnsCache && dnsCache.has(hostname)) {
                    const cachedIps = dnsCache.get(hostname)!;
                    if (cachedIps.length > 0) {
                        const ip = cachedIps[0];
                        const family = ip.includes(":") ? 6 : 4;
                        callback(null, ip, family);
                        return;
                    }
                }

                dns.lookup(hostname, options, (err, address, family) => {
                    if (err) {
                        callback(err, "", 0);
                        return;
                    }

                    const addresses = Array.isArray(address)
                        ? address
                        : [{ address, family }];

                    for (const addr of addresses) {
                        if (isPrivateIp(addr.address)) {
                            callback(new Error(`SSRF Blocked: Resolved to unsafe IP address: ${addr.address}`), "", 0);
                            return;
                        }
                    }

                    // Populate DNS cache if requested
                    if (dnsCache) {
                        const ipList = addresses.map(a => a.address);
                        dnsCache.set(hostname, ipList);
                    }

                    callback(null, address, family);
                });
            }
        }
    });
}
