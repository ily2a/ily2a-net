import "./globals.css"
import { Suspense } from "react"
import localFont from "next/font/local"
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/constants/site"
import { BACKGROUND } from "@/constants/colors"
import { safeJsonLd } from "@/lib/json-ld"
import SmoothCursor from "@/components/effects/SmoothCursor"
import { SanityLive } from "@/sanity/lib/live"
import MotionProvider from "@/components/providers/MotionProvider"
import ErrorBoundary from "@/components/errors/ErrorBoundary"
import SilentErrorBoundary from "@/components/errors/SilentErrorBoundary"
import SpeedInsightsWrapper from "@/components/providers/SpeedInsightsWrapper"
import { Analytics } from "@vercel/analytics/next"

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Light.woff2',   weight: '300', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Medium.woff2',  weight: '500', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "name": "Ily Ameur - Design Engineer Portfolio",
      "url": SITE_URL,
      "description": SITE_DESCRIPTION,
      "inLanguage": "en-GB",
      "publisher": { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      "name": SITE_NAME,
      "jobTitle": "Design Engineer",
      "url": SITE_URL,
      "image": `${SITE_URL}/og-image.png`,
      "description": SITE_DESCRIPTION,
      "knowsAbout": ["Product Design", "Design Systems", "Frontend Engineering", "UX Design"],
      "sameAs": ["https://linkedin.com/in/ily2a"],
    },
  ],
}

// Pre-stringified once at module load — JSON-LD content is static, no need to
// re-serialize and re-escape on every request.
const jsonLdString = safeJsonLd(jsonLd)

export const viewport = {
  themeColor: BACKGROUND,
}

export const metadata = {
  title: `${SITE_NAME} : Design Engineer`,
  description: SITE_DESCRIPTION,
  keywords: [
    'Design Engineer',
    'Product Designer',
    'Design Systems',
    'UX Design',
    'Frontend Engineering',
    'React',
    'React Native',
    'Figma',
    'Ily Ameur',
  ],
  openGraph: {
    title: `${SITE_NAME} : Design Engineer`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Ily Ameur - Design Engineer Portfolio",
    locale: "en_GB",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${SITE_NAME} — Design Engineer` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} : Design Engineer`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-image.png', alt: `${SITE_NAME} — Design Engineer` }],
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
    <html lang="en-GB" className={satoshi.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" />
        {/* JSON-LD structured data built from trusted site constants — the
            standard Next.js pattern for <script type="application/ld+json">,
            not user HTML. */}
        {/* react-doctor-disable-next-line react-doctor/no-danger */}
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
