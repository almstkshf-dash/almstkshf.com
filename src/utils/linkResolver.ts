import * as cheerio from 'cheerio';

interface ResolvedArticle {
    finalUrl: string;
    imageUrl?: string;
    source: string;
}

export async function resolveUrl(originalUrl: string): Promise<ResolvedArticle | null> {
    try {
        const response = await fetch(originalUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
            },
            redirect: 'follow', // Ensures redirects are followed
        });

        if (!response.ok) return null;

        const html = await response.text();
        const finalUrl = response.url;
        // @ts-ignore
        const $ = cheerio.load(html);

        // Extract Image and Site Name
        const imageUrl = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');
        const siteName = $('meta[property="og:site_name"]').attr('content') || new URL(finalUrl).hostname;

        return { finalUrl, imageUrl, source: siteName };
    } catch (error) {
        console.warn(`Failed to resolve: ${originalUrl}`, error);
        return null;
    }
}
