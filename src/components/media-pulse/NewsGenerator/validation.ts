/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { z } from 'zod';

export const FetchNewsSchema = z.object({
    success: z.boolean(),
    count: z.number().optional(),
    skipped: z.number().optional(),
    feeds: z.number().optional(),
    error: z.string().optional(),
    capacityExhausted: z.boolean().optional(),
    retryAfter: z.number().optional(),
});

export const OptimizeQuerySchema = z.object({
    optimized: z.string(),
    explanation: z.string(),
});

export const NewsGeneratorFormSchema = z.object({
    keyword: z.string()
        .min(1, { message: 'error_keyword_required' })
        .max(300, { message: 'error_keyword_too_long' }),
    countries: z.array(z.string()).min(1, { message: 'error_country_required' }),
    languages: z.array(z.string()).min(1, { message: 'error_language_required' }),
    sourceTypes: z.array(z.string()).min(1),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
}).refine(data => {
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, {
    message: 'error_date_range_invalid',
    path: ['dateRange']
});
