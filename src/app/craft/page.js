import ProjectCard from '@/components/ProjectCard'
import ContactSection from '@/components/ContactSection'
import FloatingNav from '@/components/FloatingNav'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDIES_QUERY } from '@/lib/sanity-queries'
import Link from 'next/link'

export const metadata = {
  title: 'My Craft — Ily Ameur',
  description: 'End-to-end product design across 10+ industries.',
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

      {/* ── WORK ── */}
      <section id="work" className="work-section" style={{ paddingTop: '60px' }}>
        <div className="work-inner">
          <div className="work-header-block">
            <div className="work-header">
              <h1 className="work-title">My Craft</h1>
              <Link href="/" className="work-view-all">← Back to home</Link>
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

      <ContactSection />
    </main>
  )
}
