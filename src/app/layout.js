import "./globals.css"
import { Suspense } from "react"
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/constants/site"
import SmoothCursor from "@/components/SmoothCursor"
import { SanityLive } from "@/sanity/lib/live"
import MotionProvider from "@/components/MotionProvider"
import ErrorBoundary from "@/components/ErrorBoundary"
import SilentErrorBoundary from "@/components/SilentErrorBoundary"
import SpeedInsightsWrapper from "@/components/SpeedInsightsWrapper"
import { Analytics } from "@vercel/analytics/next"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": SITE_NAME,
  "jobTitle": "Design Engineer",
  "url": SITE_URL,
  "description": "I design systems, flows and products. Then build them. End-to-end product design with zero handoff friction.",
  "knowsAbout": ["Product Design", "Design Systems", "Frontend Engineering", "UX Design"],
  "sameAs": ["https://linkedin.com/in/ily2a"],
}

// Pre-stringified once at module load — JSON-LD content is static, no need to
// re-serialize and re-escape on every request.
const jsonLdString = JSON.stringify(jsonLd)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')

export const metadata = {
  title: `${SITE_NAME} : Design Engineer`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} : Design Engineer`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} : Design Engineer`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: { url: '/favicons/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
  verification: {
    google: '0-HV9XZQSqf9eZl3DdSQmATQGNcfB9UEvqSzjQkorrM',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" />
        {/* Single stylesheet fetch — no separate preload needed since the
            browser discovers and prioritizes <link rel="stylesheet"> in <head>. */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-background focus:text-brand focus:outline focus:outline-2 focus:outline-brand btn-label"
        >
          Skip to main content
        </a>
        <MotionProvider>
          {/* SmoothCursor is decorative — silenced so a crash never wipes page content */}
          <SilentErrorBoundary><SmoothCursor /></SilentErrorBoundary>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {/* SanityLive sets up real-time preview — runs in background, no loading UI needed.
              Dev only: SanityLive calls draftMode() internally, which forces dynamic
              rendering of every route in the app. NODE_ENV is statically replaced at
              build time, so the JSX is dead-code-eliminated in production builds and
              the public site stays fully SSG. Production content updates are handled
              by the Sanity webhook → /api/revalidate. */}
          {process.env.NODE_ENV === 'development' && (
            <SilentErrorBoundary><Suspense fallback={null}><SanityLive /></Suspense></SilentErrorBoundary>
          )}
          <SilentErrorBoundary><SpeedInsightsWrapper /></SilentErrorBoundary>
          <SilentErrorBoundary><Analytics /></SilentErrorBoundary>
        </MotionProvider>
      </body>
    </html>
  )
}
