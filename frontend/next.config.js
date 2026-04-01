const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable SW in development (next dev), enable for production build
  disable: process.env.NODE_ENV === 'development',
  // Allow testing over local network HTTP (Android Chrome allows this)
  // iOS Safari requires HTTPS even for local IPs - use ngrok for iPhone testing
  // Don't precache Next.js internals that change every build
  buildExcludes: [/middleware-manifest\.json$/, /build-manifest\.json$/],
  // Offline fallback page
  fallbacks: {
    document: '/offline',
  },
  // Never let the service worker touch API calls — go straight to network
  runtimeCaching: [
    {
      // Static assets: fonts, images, icons — cache aggressively
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Next.js JS/CSS chunks — cache with network fallback
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // NOTE: API calls (/api/v1/*) are intentionally NOT cached.
    // They go directly to network so auth/login is always fast and fresh.
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure images from the backend can be loaded
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
