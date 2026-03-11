import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizeCss: true,
        optimizePackageImports: [
            'lucide-react',
            'framer-motion'
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

export default withNextIntl(nextConfig);
