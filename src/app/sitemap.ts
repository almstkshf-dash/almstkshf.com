import { MetadataRoute } from 'next'

const locales = ['en', 'ar']
const routes = [
    '',
    '/case-studies/lexcora',
    '/case-studies/styling-assistant',
    '/technical-solutions/smart-media-assistant',
    '/technical-solutions/kyc',
    '/technical-solutions/integration',
    '/media-monitoring/tv-radio',
    '/media-monitoring/press',
    '/media-monitoring/reports',
    '/media-monitoring/media-pulse',
    '/media-monitoring/crisis-management',
    '/contact',
    '/behind-the-scene',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemapData: MetadataRoute.Sitemap = []

    locales.forEach((locale) => {
        routes.forEach((route) => {
            sitemapData.push({
                url: `https://almstkshf.com/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: route === '' ? 1 : 0.8,
            })
        })
    })

    return sitemapData
}
