import HeroSection from '@/components/HeroSection'
import ProjectCard from '@/components/ProjectCard'
import { client } from '@/sanity/lib/client'
import Link from 'next/link'

export default async function Home() {
  const projects = await client.fetch(
    `*[_type == "caseStudy"] | order(order asc) [0...4] {
      _id, title, slug, description, tags, cardImageDefault
    }`
  )

  return (
    <main>
      <HeroSection />

      {/* ── WORK ── */}
      <section className="work-section">
        <div className="work-inner">
          <div className="work-header-block">
            <div className="work-header">
              <h2 className="work-title">My Craft</h2>
              <Link href="/work" className="work-view-all">View all projects</Link>
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