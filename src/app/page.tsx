import { Suspense } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import CraftSection from '@/components/sections/CraftSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import CapabilitiesSection from '@/components/sections/CapabilitiesSection'
import ContactSection from '@/components/sections/ContactSection'
import FloatingNav from '@/components/nav/FloatingNav'
import ScrollToSection from '@/components/nav/ScrollToSection'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import { fetchSanityList } from '@/sanity/lib/live'
import { CASE_STUDIES_FEATURED_QUERY } from '@/lib/sanity-queries'
import { HERO_NAV_DELAY } from '@/constants/animations'
import type { ProjectCardData } from '@/components/cards/ProjectCard'

export default async function Home() {
  const projects = await fetchSanityList<ProjectCardData>('page.tsx', CASE_STUDIES_FEATURED_QUERY)

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
