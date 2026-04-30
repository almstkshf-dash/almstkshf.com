/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const commonDisallow = [
        '/api/',
        '/convex/',
        '/en/dashboard/',
        '/ar/dashboard/',
        '/dashboard/',
        '/_next/',
        '/admin/',
    ];

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: commonDisallow,
            },
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/_next/static/',
                    '/_next/image',
                ],
                disallow: commonDisallow,
            },
            // AI Search Bots - Allow crawling for citations and answers in search generative experiences
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'YouBot'],
                allow: '/',
                disallow: commonDisallow,
            },
            // AI Training Opt-out (optional but recommended for data protection)
            {
                userAgent: 'Google-Extended',
                disallow: commonDisallow,
            },
            {
                userAgent: 'CCBot',
                disallow: '/',
            },
            {
                userAgent: 'Googlebot-Image',
                allow: '/',
            },
        ],
        sitemap: 'https://almstkshf.com/sitemap.xml',
    }
}
