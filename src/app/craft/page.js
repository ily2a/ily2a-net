import CraftSection from '@/components/CraftSection'
import ContactSection from '@/components/ContactSection'
import FloatingNav from '@/components/FloatingNav'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDIES_QUERY } from '@/lib/sanity-queries'
import { SITE_URL, SITE_NAME } from '@/constants/site'

export const revalidate = 3600

export const metadata = {
  title: `Craft — ${SITE_NAME}`,
  description: 'End-to-end product design across 10+ industries.',
  alternates: { canonical: `${SITE_URL}/craft` },
  openGraph: {
    title: `Craft — ${SITE_NAME}`,
    description: 'End-to-end product design across 10+ industries.',
    url: `${SITE_URL}/craft`,
    siteName: SITE_NAME,
    locale: 'en_GB',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Craft — ${SITE_NAME}`,
    description: 'End-to-end product design across 10+ industries.',
    images: ['/og-image.png'],
  },
}

export default async function CraftPage() {
  let projects = []
  try {
    const { data } = await sanityFetch({ query: CASE_STUDIES_QUERY })
    projects = data ?? []
  } catch (e) {
    console.error('[craft/page.js] Sanity fetch failed:', e)
  }

  return (
    <main>
      <FloatingNav />
      <CraftSection projects={projects} headingAs="h1" navOffset />
      <ContactSection />
    </main>
  )
}
