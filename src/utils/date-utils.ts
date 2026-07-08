/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * Safely parse a date string which could be DD/MM/YYYY, YYYY-MM-DD, or an ISO string.
 * Returns null if the string is empty or invalid.
 */
export function parsePublishedDate(d?: string): Date | null {
    if (!d) return null;
    const trimmed = d.trim();
    if (!trimmed) return null;

    // ISO format or YYYY-MM-DD: e.g. 2026-07-07
    if (trimmed.includes("-")) {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    // Assume DD/MM/YYYY or YYYY/MM/DD
    if (trimmed.includes("/")) {
        const parts = trimmed.split("/").map(n => parseInt(n, 10));
        if (parts.length === 3) {
            // Check if first part looks like a year: YYYY/MM/DD
            if (parts[0] > 1000) {
                const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
                if (!isNaN(parsed.getTime())) return parsed;
            } else {
                // DD/MM/YYYY
                const parsed = new Date(parts[2], parts[1] - 1, parts[0]);
                if (!isNaN(parsed.getTime())) return parsed;
            }
        }
    }

    // Generic fallback
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;
}
