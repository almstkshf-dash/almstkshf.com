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
