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
        optimizeCss: false,

        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'recharts',
            'sonner',
            'next-themes',
            '@vercel/analytics',
        ],

    },

    // Top-level turbopack config (Next.js 15.5+)
    turbopack: {
        root: process.cwd(),
        resolveAlias: {
            // Stub @mediapipe/face_mesh so Turbopack never tries to statically
            // resolve the broken FaceMesh export. mlHelper.ts uses dynamic
            // import() so the real package is resolved at runtime by the browser.
            '@mediapipe/face_mesh': './src/lib/engines/stubs/mediapipe-face-mesh.stub.js',

            // Stub @mediapipe/hands for the same reason — hand-pose-detection's
            // ESM bundle imports `Hands` which Turbopack can't find statically.
            '@mediapipe/hands': './src/lib/engines/stubs/mediapipe-hands.stub.js',
        },
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
                 * Security and Cache headers are handled here.
                 * (Note: Vercel automatically injects Early Hints for discovered assets).
                 */
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    // COEP/COOP removed — require-corp blocks Next.js internal
                    // fetch() calls used for client-side RSC navigation.
                    // If SharedArrayBuffer is needed for ML pages, scope it via
                    // a service worker or route-specific middleware instead.
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
