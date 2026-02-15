import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        webpackMemoryOptimizations: true,
        optimizePackageImports: ['lucide-react', 'framer-motion', 'cheerio', 'jspdf'],
    },
};

export default withNextIntl(nextConfig);
