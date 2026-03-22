import HeroSection from '@/components/HeroSection'
import ProjectCard from '@/components/ProjectCard'
import TestimonialsSection from '@/components/TestimonialsSection'
import CapabilitiesSection from '@/components/CapabilitiesSection'
import ContactSection from '@/components/ContactSection'
import FloatingNav from '@/components/FloatingNav'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDIES_FEATURED_QUERY } from '@/lib/sanity-queries'
import { HERO_NAV_DELAY } from '@/constants/animations'
import Link from 'next/link'

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
      <FloatingNav delay={HERO_NAV_DELAY} />
      <HeroSection>
        <h1 className="hero-heading">Ily Ameur</h1>
      </HeroSection>

      {/* ── WORK ── */}
      <section id="work" className="work-section">
        <div className="work-inner">
          <div className="work-header-block">
            <div className="work-header">
              <h2 className="work-title">My Craft</h2>
              <Link href="/craft" className="work-view-all">View all projects</Link>
            </div>
            <p className="work-subtitle text-md">
              End-to-end product design across 10+ industries. Increasingly, I build what I design.
            </p>
          </div>
          <div className="work-grid">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <CapabilitiesSection />
      <ContactSection />
    </main>
  )
}
