import HeroSection from '@/components/HeroSection'
import ProjectCard from '@/components/ProjectCard'
import { sanityFetch } from '@/sanity/lib/live'
import Link from 'next/link'

export default async function Home() {
  let projects = []
  try {
    const { data } = await sanityFetch({
      query: `*[_type == "caseStudy"] | order(order asc) [0...4] {
        _id, title, slug, description, tags,
        cardImageDefault { ..., "lqip": asset->metadata.lqip },
        cardImageHover   { ..., "lqip": asset->metadata.lqip }
      }`,
    })
    projects = data ?? []
  } catch {
    // Sanity fetch failed — render page with empty project list
  }

  return (
    <main>
      <HeroSection>
        <h1 className="hero-heading">Ily Ameur</h1>
      </HeroSection>

      {/* ── WORK ── */}
      <section className="work-section">
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
    </main>
  )
}