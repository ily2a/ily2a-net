import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// Tighten to specific Sanity origins instead of a wildcard.
// Falls back to wildcard only if the project ID env var is missing (e.g. CI).
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const sanityConnectSrc = sanityProjectId
  ? `https://api.sanity.io https://cdn.sanity.io https://${sanityProjectId}.api.sanity.io`
  : 'https://*.sanity.io'

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js requires unsafe-inline for its runtime scripts (inline styles/scripts injected by the framework)
  // React dev mode requires unsafe-eval for callstack reconstruction; never used in production
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://vercel.live https://cal.com https://app.cal.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://cal.com https://app.cal.com https://vercel.com https://vercel.live",
  `font-src 'self' https://vercel.live`,
  `frame-src https://cal.com https://app.cal.com https://www.figma.com https://embed.figma.com https://vercel.live`,
  `connect-src 'self' ${sanityConnectSrc} https://cal.com https://app.cal.com https://*.pusher.com wss://*.pusher.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vitals.vercel-analytics.com`,
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  // Modern equivalent of X-Frame-Options; blocks framing by any other origin.
  "frame-ancestors 'self'",
  // Restricts where <form action="..."> can submit; prevents injected forms
  // from POSTing to attacker origins.
  "form-action 'self'",
].join('; ')

// Sanity Studio needs unsafe-eval for its plugin system + broader origins.
// Scoped to /studio only so the main site CSP remains strict.
const StudioCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io",
  "style-src 'self' 'unsafe-inline' https://cdn.sanity.io",
  "img-src * data: blob:",
  `connect-src 'self' https://*.sanity.io wss://*.sanity.io`,
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
  "font-src 'self' data: https://cdn.sanity.io",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
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
      // Studio route — permissive CSP required by Sanity Studio's plugin system.
      // The catch-all below explicitly excludes /studio (negative lookahead), so
      // this is the ONLY CSP that applies there. (Next.js applies last-match-wins
      // when two entries set the same header for the same path, so we must not let
      // the strict site CSP also match /studio — it would override this one.)
      {
        source: '/studio(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: StudioCSP },
        ],
      },
      // Long-cache static assets that ship from /public. Filenames are stable
      // (no Next.js content hash) so updates require a deploy with a renamed
      // file or cache bust. Fonts get the full year + immutable since they're
      // truly invariant; favicons get a month since they may rotate during
      // brand work but rarely.
      {
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
        ],
      },
      // Brand assets (logo SVGs) — stable filenames, rarely change. One month,
      // same rationale as favicons (a brand refresh would rename/cache-bust).
      {
        source: '/assets/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
        ],
      },
      // All other routes — strict CSP + security headers. Excludes /studio via
      // negative lookahead so the strict CSP never overrides StudioCSP above.
      {
        source: '/((?!studio).*)',
        headers: [
          { key: 'Content-Security-Policy',   value: ContentSecurityPolicy },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
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
