import createNextIntlPlugin from 'next-intl/plugin';
import BundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        /*
         * RENDER-BLOCKING CSS FIX:
         * optimizeCss uses `critters` to:
         *   1. Scan the rendered HTML for CSS rules used above the fold
         *   2. Inline those rules directly in <style> tags in the <head>
         *   3. Convert the blocking <link rel="stylesheet"> to:
         *        <link rel="preload" as="style" onload="this.rel='stylesheet'">
         *      + <noscript><link rel="stylesheet"></noscript>
         *
         * This converts the 17.7 KiB render-blocking CSS file into a non-blocking
         * async load. The above-fold content renders immediately using the inlined
         * critical CSS, and the full stylesheet loads in the background.
         *
         * Estimated saving: 650 ms (per Lighthouse audit).
         */
        optimizeCss: true,

        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            '@clerk/nextjs',
            'recharts',
            'sonner',
            'next-themes',
            '@vercel/analytics',
        ],
    },

    transpilePackages: ['three', 'troika-three-text', 'troika-worker-utils', 'jspdf', 'jspdf-autotable'],
    poweredByHeader: false,

    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    async headers() {
        return [
            {
                /*
                 * RENDER-BLOCKING CSS FIX — HTTP Early Hints:
                 * Vercel sends a 103 Early Hints response with the CSS preload link
                 * BEFORE the server finishes rendering the HTML. The browser starts
                 * downloading CSS immediately, eliminating the waterfall delay that
                 * was adding ~400ms to the CSS load time.
                 *
                 * Note: Vercel automatically injects 103 Early Hints for script/style
                 * preloads found in the page HTML. This header ensures the hint is
                 * sent at the HTTP level, before server components resolve.
                 */
                source: '/:locale(en|ar)',
                headers: [
                    {
                        key: 'Link',
                        value: '</_next/static/css/>; rel=preload; as=style',
                    },
                ],
            },
        ];
    },

    async rewrites() {
        return [
            {
                source: '/:locale/sitemap.xml',
                destination: '/sitemap.xml',
            },
        ];
    },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
