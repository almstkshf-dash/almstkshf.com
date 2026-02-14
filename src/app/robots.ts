import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/_next/',
                '/convex/',
                '/en/dashboard/',
                '/ar/dashboard/',
                '/dashboard/',
                '/en/settings/',
                '/ar/settings/',
                '/settings/',
            ],
        },
        sitemap: 'https://almstkshf.com/sitemap.xml',
    }
}
