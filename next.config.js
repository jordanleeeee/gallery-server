/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    reactStrictMode: true,
    
    // Build performance optimizations
    swcMinify: true,
    // experimental: {
    //     // Enable faster builds with turbopack in dev mode
    //     turbo: {},
    // },
    
    // Compiler optimizations
    compiler: {
        // Remove console.log in production builds
        removeConsole: process.env.NODE_ENV === 'production',
    },
    
    // Performance optimizations
    poweredByHeader: false,
    
    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },
    
    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Optimize for production builds
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                    common: {
                        minChunks: 2,
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                },
            };
        }
        
        return config;
    },
};

module.exports = withBundleAnalyzer(nextConfig);
