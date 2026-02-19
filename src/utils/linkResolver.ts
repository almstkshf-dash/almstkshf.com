import * as cheerio from 'cheerio';
import { isIP } from 'net';
import dns from 'dns/promises';

const PRIVATE_IP_RANGES = [
    /^10\./,
    /^127\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^192\.168\./,
];

const PRIVATE_IPV6_PREFIXES = [
    /^::1$/i,
    /^fc00:/i,
    /^fd00:/i,
    /^fe80:/i,
];

function isPrivateIp(ip: string): boolean {
    if (ip.includes(':')) {
        return PRIVATE_IPV6_PREFIXES.some((re) => re.test(ip));
    }
    return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

async function isUnsafeHostname(hostname: string): Promise<boolean> {
    const lowered = hostname.toLowerCase();
    if (lowered === 'localhost' || lowered.endsWith('.local') || lowered.endsWith('.internal')) {
        return true;
    }

    if (isIP(hostname)) {
        return isPrivateIp(hostname);
    }

    try {
        const results = await dns.lookup(hostname, { all: true });
        return results.some((entry) => isPrivateIp(entry.address));
    } catch {
        return true;
    }
}

interface ResolvedArticle {
    finalUrl: string;
    imageUrl?: string;
    source: string;
}

export async function resolveUrl(originalUrl: string): Promise<ResolvedArticle | null> {
    try {
        const parsed = new URL(originalUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }

        if (await isUnsafeHostname(parsed.hostname)) {
            return null;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

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
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) return null;

        const finalUrl = response.url;
        const finalParsed = new URL(finalUrl);
        if (await isUnsafeHostname(finalParsed.hostname)) {
            return null;
        }

        const html = await response.text();
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
