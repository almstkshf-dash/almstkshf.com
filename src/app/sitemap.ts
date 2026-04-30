/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { MetadataRoute } from 'next'

const BASE_URL = 'https://almstkshf.com'

// Public routes only — private/authenticated routes must never appear in the sitemap
const routes = [
    '',
    '/case-studies/lexcora',
    '/case-studies/styling-assistant',
    '/technical-solutions/smart-media-assistant',
    '/technical-solutions/kyc',
    '/technical-solutions/integration',
    '/media-monitoring/tv-radio',
    '/media-monitoring/press',
    '/media-monitoring/central-media-repository',
    '/media-monitoring/media-pulse',
    '/media-monitoring/crisis-management',
    '/contact',
    '/pricing',
    '/privacy',
    '/terms',
    '/inspect',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemapData: MetadataRoute.Sitemap = []

    routes.forEach((route) => {
        // For every route, add one entry per locale that cross-references all alternates
        // Next.js serialises `alternates.languages` as xhtml:link rel="alternate" in the XML
        sitemapData.push({
            url: `${BASE_URL}/en${route}`,
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
            alternates: {
                languages: {
                    en: `${BASE_URL}/en${route}`,
                    ar: `${BASE_URL}/ar${route}`,
                    'x-default': `${BASE_URL}/en${route}`,
                },
            },
        })

        sitemapData.push({
            url: `${BASE_URL}/ar${route}`,
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
            alternates: {
                languages: {
                    en: `${BASE_URL}/en${route}`,
                    ar: `${BASE_URL}/ar${route}`,
                    'x-default': `${BASE_URL}/en${route}`,
                },
            },
        })
    })

    return sitemapData
}
