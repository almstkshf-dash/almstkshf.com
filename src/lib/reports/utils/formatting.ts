/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export function formatDate(dateStr?: string | number): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString();
    } catch {
        return String(dateStr);
    }
}

export function formatNumber(val?: number): string {
    if (val === undefined || val === null) return '0';
    return val.toLocaleString();
}

export function formatCurrency(val?: number): string {
    if (val === undefined || val === null) return '$0';
    return `$${val.toLocaleString()}`;
}
