import { Suspense } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import CraftSection from '@/components/sections/CraftSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import CapabilitiesSection from '@/components/sections/CapabilitiesSection'
import ContactSection from '@/components/sections/ContactSection'
import FloatingNav from '@/components/nav/FloatingNav'
import ScrollToSection from '@/components/nav/ScrollToSection'
import SilentErrorBoundary from '@/components/SilentErrorBoundary'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDIES_FEATURED_QUERY } from '@/lib/sanity-queries'
import { HERO_NAV_DELAY } from '@/constants/animations'

export default async function Home() {
  let projects = []
  try {
    const { data } = await sanityFetch({ query: CASE_STUDIES_FEATURED_QUERY })
    projects = data ?? []
  } catch (e) {
    console.error('[page.js] Sanity fetch failed:', e)
  }

  return (
    <main id="main-content">
      <Suspense fallback={null}>
        <ScrollToSection />
      </Suspense>
      <SilentErrorBoundary><FloatingNav delay={HERO_NAV_DELAY} /></SilentErrorBoundary>
      <HeroSection>
        <h1 className="heading-hero">Ily Ameur</h1>
      </HeroSection>

      <CraftSection projects={projects} showViewAll />

      <TestimonialsSection />
      <CapabilitiesSection />
      <SilentErrorBoundary><ContactSection /></SilentErrorBoundary>
    </main>
  )
}
