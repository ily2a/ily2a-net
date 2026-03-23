import "./globals.css"
import { Suspense } from "react"
import { SmoothCursor } from "@/components/SmoothCursor"
import { SanityLive } from "@/sanity/lib/live"
import MotionProvider from "@/components/MotionProvider"
import ErrorBoundary from "@/components/ErrorBoundary"
import { SpeedInsights } from "@vercel/speed-insights/next"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ily Ameur",
  "jobTitle": "Design Engineer",
  "url": "https://ily2a.net",
  "description": "I design systems, flows and products. Then build them. End-to-end product design with zero handoff friction.",
  "knowsAbout": ["Product Design", "Design Systems", "Frontend Engineering", "UX Design"],
}

export const metadata = {
  title: "Ily Ameur : Design Engineer",
  description: "I design systems, flows and products. Then build them. End-to-end product design with zero handoff friction.",
  openGraph: {
    title: "Ily Ameur : Design Engineer",
    description: "I design systems, flows and products. Then build them. End-to-end product design with zero handoff friction.",
    url: "https://ily2a.net",
    siteName: "Ily Ameur",
    locale: "en_GB",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ily Ameur : Design Engineer",
    description: "I design systems, flows and products. Then build them. End-to-end product design with zero handoff friction.",
    images: ['/og-image.png'],
  },
  metadataBase: new URL("https://ily2a.net"),
  alternates: {
    canonical: "https://ily2a.net",
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
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <MotionProvider>
          <ErrorBoundary>
            <SmoothCursor />
            {children}
            {/* SanityLive sets up real-time preview — runs in background, no loading UI needed */}
            <Suspense fallback={null}><SanityLive /></Suspense>
            <SpeedInsights />
          </ErrorBoundary>
        </MotionProvider>
      </body>
    </html>
  )
}
