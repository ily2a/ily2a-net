import ProjectCard from '@/components/ProjectCard'
import Link from 'next/link'

export default function CraftSection({
  projects = [],
  headingAs: Tag = 'h2',
  showViewAll = false,
  navOffset = false,
}) {
  return (
    <section
      id="work"
      className={`w-full flex justify-center px-4 py-7 min-[730px]:px-10 min-[730px]:py-8 min-[1088px]:px-14 min-[1088px]:py-10 xl:px-20${navOffset ? ' pt-[60px]' : ''}`}
    >
      <div className="w-full max-w-[600px] flex flex-col gap-8 min-[730px]:max-w-none xl:max-w-[1440px]">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <Tag className="font-bold text-[20px] xl:text-2xl tracking-[-0.01em] text-text-primary">My Craft</Tag>
            {showViewAll && (
              <Link href="/craft" className="text-[14px] font-medium text-brand no-underline tracking-[-0.01em] whitespace-nowrap hover:opacity-70 transition-opacity">
                View all projects
              </Link>
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
