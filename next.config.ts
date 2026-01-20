import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Optimize package imports for faster builds
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.1.34:3000', '192.168.1.34']
    }
  },
  // Better logging for debugging
  logging: {
    fetches: { fullUrl: true },
  },
};

export default withNextIntl(nextConfig);
