// import withBundleAnalyzer from '@next/bundle-analyzer';
import { type NextConfig } from 'next';

// import { env } from './env.mjs';

const config: NextConfig = {
    headers: () => {
        return [
            {
                // establishes cross-origin isolation for origin private
                // file system for local SQLite
                source: '/:path*',
                headers: [
                    {
                        key: 'cross-origin-embedder-policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'cross-origin-opener-policy',
                        value: 'same-origin',
                    },
                ],
            },
        ];
    },
    reactStrictMode: true,
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    rewrites: () => [],
};

export default config; // env.ANALYZE ? withBundleAnalyzer({ enabled: env.ANALYZE })(config) : config;
