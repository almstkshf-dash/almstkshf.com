import createNextIntlPlugin from 'next-intl/plugin';
import BundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    experimental: {
        /*
         * optimizeCss (using `critters`) is disabled because it converts blocking stylesheets into 
         * `<link rel="preload" as="style" onload="this.rel='stylesheet'">` tags. In modern browsers, 
         * this triggers persistent "preload but not used within a few seconds" warnings in the console, 
         * cluttering the dev logs and confusing testing suites, especially when inline JS is blocked by CSP.
         */
        optimizeCss: false,

        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'recharts',
            'sonner',
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

            // Stub @aws-sdk/client-s3 to prevent Turbopack/Next.js from attempting to
            // resolve it at build time when scanning unzipper (dependency of exceljs).
            '@aws-sdk/client-s3': './src/lib/engines/stubs/aws-s3.stub.js',
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

    webpack: (config, { webpack }) => {
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^@aws-sdk\/client-s3$/,
            })
        );
        return config;
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
            {
                source: '/:locale/robots.txt',
                destination: '/robots.txt',
            },
        ];
    },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
