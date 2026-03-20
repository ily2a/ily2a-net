/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Note: do NOT set unoptimized: true globally — it disables WebP/AVIF conversion
    // for all images. SVG components that need it set unoptimized per-instance.
  },

  compiler: {
    // Strip console.log in production; keep console.error for monitoring
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  async redirects() {
    return [
      // Keep these until /work is a real route
      { source: '/work', destination: '/craft', permanent: false },
      { source: '/work/:slug', destination: '/craft/:slug', permanent: false },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
