'use client'

import type { ElementType } from 'react'
import Link from 'next/link'
import { m, type Variants } from 'framer-motion'
import ProjectCard, { type ProjectCardData } from '@/components/cards/ProjectCard'
import ViewAllProjectsButton from '@/components/buttons/ViewAllProjectsButton'
import { CRAFT_DESCRIPTION } from '@/constants/site'
import { SPRING_SNAP, EASE_OUT } from '@/constants/animations'

const MotionLink = m.create(Link)

const GRID_STAGGER: Variants = {
  hidden: { opacity: 1 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const CARD_ENTER: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

// Stable empty default so an omitted `projects` prop keeps the same reference
// across renders instead of allocating a fresh array each time.
const EMPTY_PROJECTS: ProjectCardData[] = []

interface CraftSectionProps {
  projects?: ProjectCardData[]
  headingAs?: ElementType
  showViewAll?: boolean
  navOffset?: boolean
  // How many leading card images to fetch with priority. Defaults to 0: on the
  // home page the grid sits below an h-screen hero, so eagerly preloading those
  // images just contends with fonts/JS/hero for bandwidth. The /craft page (cards
  // above the fold) passes 2.
  priorityCount?: number
}

export default function CraftSection({
  projects = EMPTY_PROJECTS,
  headingAs: Tag = 'h2',
  showViewAll = false,
  navOffset = false,
  priorityCount = 0,
}: CraftSectionProps) {
  return (
    <section
      id="work"
      tabIndex={-1}
      className={`outline-none w-full flex justify-center px-4 py-7 tab:px-10 tab:py-8 desk:px-14 desk:py-10 xl:px-20${navOffset ? ' pt-[60px]' : ''}`}
    >
      <div className="w-full max-w-[600px] flex flex-col gap-5 tab:gap-8 tab:max-w-none xl:max-w-[1440px]">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <Tag className="heading-section text-text-primary">Craft</Tag>
            {showViewAll && (
              <>
                <div className="tab:hidden">
                  <MotionLink
                    href="/craft"
                    className="inline-flex items-center h-9 px-[6px] link-label no-underline"
                    animate={{ color: 'var(--color-text-primary)' }}
                    whileHover={{ color: 'var(--color-brand)' }}
                    whileTap={{ color: 'var(--color-brand)' }}
                    transition={SPRING_SNAP}
                  >View all projects</MotionLink>
                </div>
                <div className="hidden tab:block">
                  <ViewAllProjectsButton />
                </div>
              </>
            )}
          </div>
          <p className="text-md text-text-secondary">{CRAFT_DESCRIPTION}</p>
        </div>
        <m.div
          className="grid grid-cols-1 gap-4 mobile:grid-cols-2"
          variants={GRID_STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {projects.map((project, i) => (
            <m.div key={project._id} variants={CARD_ENTER}>
              <ProjectCard project={project} priority={i < priorityCount} />
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
