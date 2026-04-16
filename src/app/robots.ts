/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // General crawlers: allow public pages, block private/API routes
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/convex/',
                    '/en/dashboard/',
                    '/ar/dashboard/',
                    '/dashboard/',
                ],
            },
            // Googlebot: explicitly allow static assets so the page can be rendered
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/_next/static/',
                    '/_next/image',
                ],
                disallow: [
                    '/api/',
                    '/convex/',
                    '/en/dashboard/',
                    '/ar/dashboard/',
                    '/dashboard/',
                ],
            },
            // Block Googlebot-Image from nothing (let it crawl all images)
            {
                userAgent: 'Googlebot-Image',
                allow: '/',
            },
        ],
        sitemap: 'https://almstkshf.com/sitemap.xml',
    }
}
