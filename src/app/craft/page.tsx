import type { Metadata } from 'next'
import CraftSection from '@/components/sections/CraftSection'
import ContactSection from '@/components/sections/ContactSection'
import FloatingNav from '@/components/nav/FloatingNav'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import { fetchSanityList } from '@/sanity/lib/live'
import { CASE_STUDIES_QUERY } from '@/lib/sanity-queries'
import { SITE_URL, SITE_NAME, CRAFT_DESCRIPTION } from '@/constants/site'
import type { ProjectCardData } from '@/components/cards/ProjectCard'

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
    images: [{ url: '/og-image.jpg', width: 1644, height: 916, alt: `Craft — ${SITE_NAME}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Craft — ${SITE_NAME}`,
    description: CRAFT_DESCRIPTION,
    images: [{ url: '/og-image.jpg', alt: `Craft — ${SITE_NAME}` }],
  },
}

export default async function CraftPage() {
  const projects = await fetchSanityList<ProjectCardData>('craft/page.tsx', CASE_STUDIES_QUERY)

  return (
    <main id="main-content">
      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>
      <CraftSection projects={projects} headingAs="h1" navOffset priorityCount={2} />
      <SilentErrorBoundary><ContactSection /></SilentErrorBoundary>
    </main>
  )
}
