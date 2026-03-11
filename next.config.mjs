import createNextIntlPlugin from 'next-intl/plugin';
import BundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
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
