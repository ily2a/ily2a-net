/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js requires unsafe-inline for its runtime scripts (inline styles/scripts injected by the framework)
  // React dev mode requires unsafe-eval for callstack reconstruction; never used in production
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://cal.com https://app.cal.com`,
  "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://cal.com https://app.cal.com",
  "font-src 'self' https://api.fontshare.com",
  "frame-src https://cal.com https://app.cal.com",
  "connect-src 'self' https://*.sanity.io https://api.fontshare.com https://cal.com https://app.cal.com",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

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
      // Permanent (308) — /work is a renamed route, not a temporary redirect.
      // Browsers and search engines will cache this and stop hitting the server.
      { source: '/work', destination: '/craft', permanent: true },
      { source: '/work/:slug', destination: '/craft/:slug', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',   value: ContentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
