'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ProjectCard from '@/components/ProjectCard'
import ViewAllProjectsButton from '@/components/buttons/ViewAllProjectsButton'
import { CRAFT_DESCRIPTION } from '@/constants/site'
import { SPRING_SNAP, EASE_OUT } from '@/constants/animations'

const MotionLink = motion(Link)

const GRID_STAGGER = {
  hidden: { opacity: 1 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const CARD_ENTER = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

export default function CraftSection({
  projects = [],
  headingAs: Tag = 'h2',
  showViewAll = false,
  navOffset = false,
}) {
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
        <motion.div
          className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2"
          variants={GRID_STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {projects.map((project, i) => (
            <motion.div key={project._id} variants={CARD_ENTER}>
              <ProjectCard project={project} priority={i < 2} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
