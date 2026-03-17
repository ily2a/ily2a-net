import HeroSection from '@/components/HeroSection'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import Link from 'next/link'
import Image from 'next/image'

export default async function Home() {
  const projects = await client.fetch(
    `*[_type == "caseStudy"] | order(order asc) [0...4] {
      _id, title, slug, description, coverImage
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
              <Link
                key={project._id}
                href={`/work/${project.slug.current}`}
                className="project-card"
              >
                <div className="project-card-image">
                  <Image
                    src={urlFor(project.coverImage).width(800).url()}
                    alt={project.title}
                    fill
                    sizes="(max-width: 600px) 100vw, 50vw"
                    className="project-card-img"
                  />
                </div>
                <div className="project-card-info">
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-desc">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}