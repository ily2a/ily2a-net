import type { Metadata } from 'next'
import CraftSection from '@/components/sections/CraftSection'
import ContactSection from '@/components/sections/ContactSection'
import FloatingNav from '@/components/nav/FloatingNav'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDIES_QUERY } from '@/lib/sanity-queries'
import { SITE_URL, SITE_NAME, CRAFT_DESCRIPTION } from '@/constants/site'
import type { ProjectCardData } from '@/components/ProjectCard'

export const metadata: Metadata = {
  title: `Craft — ${SITE_NAME}`,
  description: CRAFT_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/craft` },
  openGraph: {
    title: `Craft — ${SITE_NAME}`,
    description: CRAFT_DESCRIPTION,
    url: `${SITE_URL}/craft`,
    siteName: SITE_NAME,
    locale: 'en_GB',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `Craft — ${SITE_NAME}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Craft — ${SITE_NAME}`,
    description: CRAFT_DESCRIPTION,
    images: [{ url: '/og-image.png', alt: `Craft — ${SITE_NAME}` }],
  },
}

export default async function CraftPage() {
  let projects: ProjectCardData[] = []
  try {
    const { data } = await sanityFetch({ query: CASE_STUDIES_QUERY })
    projects = (data ?? []) as ProjectCardData[]
  } catch (e) {
    console.error('[craft/page.tsx] Sanity fetch failed:', e)
  }

  return (
    <main id="main-content">
      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>
      <CraftSection projects={projects} headingAs="h1" navOffset />
      <SilentErrorBoundary><ContactSection /></SilentErrorBoundary>
    </main>
  )
}
