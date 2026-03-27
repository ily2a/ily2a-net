import { Suspense } from 'react'
import HeroSection from '@/components/HeroSection'
import CraftSection from '@/components/CraftSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import CapabilitiesSection from '@/components/CapabilitiesSection'
import ContactSection from '@/components/ContactSection'
import FloatingNav from '@/components/FloatingNav'
import ScrollToSection from '@/components/ScrollToSection'
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
    <main>
      <Suspense fallback={null}>
        <ScrollToSection />
      </Suspense>
      <SilentErrorBoundary><FloatingNav delay={HERO_NAV_DELAY} /></SilentErrorBoundary>
      <HeroSection>
        <h1 className="font-bold tracking-[0.01em] leading-none text-[36px] md:text-[38px] lg:text-[56px] xl:text-[64px] text-balance">Ily Ameur</h1>
      </HeroSection>

      <CraftSection projects={projects} showViewAll />

      <TestimonialsSection />
      <CapabilitiesSection />
      <SilentErrorBoundary><ContactSection /></SilentErrorBoundary>
    </main>
  )
}
