import CraftSection from '@/components/CraftSection'
import ContactSection from '@/components/ContactSection'
import FloatingNav from '@/components/FloatingNav'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDIES_QUERY } from '@/lib/sanity-queries'

export const revalidate = 3600

export const metadata = {
  title: 'Craft — Ily Ameur',
  description: 'End-to-end product design across 10+ industries.',
  alternates: { canonical: 'https://ily2a.net/craft' },
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
