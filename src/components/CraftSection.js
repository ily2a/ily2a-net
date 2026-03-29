import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'
import SpotlightButton from '@/components/SpotlightButton'

export default function CraftSection({
  projects = [],
  headingAs: Tag = 'h2',
  showViewAll = false,
  navOffset = false,
}) {
  return (
    <section
      id="work"
      className={`w-full flex justify-center px-4 py-7 tab:px-10 tab:py-8 desk:px-14 desk:py-10 xl:px-20${navOffset ? ' pt-[60px]' : ''}`}
    >
      <div className="w-full max-w-[600px] flex flex-col gap-5 tab:gap-8 tab:max-w-none xl:max-w-[1440px]">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <Tag className="heading-section text-text-primary">Craft</Tag>
            {showViewAll && (
              <>
                <div className="tab:hidden">
                  <Link href="/craft" className="inline-flex items-center h-9 px-[6px] text-white hover:text-brand active:text-brand transition-colors duration-150 link-label no-underline">View all projects</Link>
                </div>
                <div className="hidden tab:block">
                  <SpotlightButton href="/craft" variant="dark">View all projects</SpotlightButton>
                </div>
              </>
            )}
          </div>
          <p className="text-md text-text-secondary">
            End-to-end product design across 10+ industries. Increasingly, I build what I design.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
