'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'
import { useWindowWidth } from '@/hooks/useWindowWidth'

const BLUR_LAYERS = [
  { blur: 0.5, mask: 'linear-gradient(rgba(0,0,0,0) 0%,#000 12.5%,#000 25%,rgba(0,0,0,0) 37.5%)' },
  { blur: 1,   mask: 'linear-gradient(rgba(0,0,0,0) 12.5%,#000 25%,#000 37.5%,rgba(0,0,0,0) 50%)' },
  { blur: 2,   mask: 'linear-gradient(rgba(0,0,0,0) 25%,#000 37.5%,#000 50%,rgba(0,0,0,0) 62.5%)' },
  { blur: 4,   mask: 'linear-gradient(rgba(0,0,0,0) 37.5%,#000 50%,#000 62.5%,rgba(0,0,0,0) 75%)' },
  { blur: 8,   mask: 'linear-gradient(rgba(0,0,0,0) 50%,#000 62.5%,#000 75%,rgba(0,0,0,0) 87.5%)' },
  { blur: 16,  mask: 'linear-gradient(rgba(0,0,0,0) 62.5%,#000 75%,#000 87.5%,#000 100%)' },
  { blur: 32,  mask: 'linear-gradient(rgba(0,0,0,0) 75%,#000 87.5%,#000 100%)' },
]

const overlayVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

const contentVariants = {
  rest: { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const imgVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const mobileImgVariants = {
  rest: { scale: 1 },
  pressed: { scale: 1.03, transition: { duration: 0.2, ease: 'easeOut' } },
}

const ProjectCard = memo(function ProjectCard({ project }) {
  const width = useWindowWidth()
  const isCompact = width > 0 && width < 1200

  if (isCompact) {
    return (
      <motion.div
        initial="rest"
        whileTap="pressed"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <Link href={`/work/${project.slug.current}`} className="project-card-mobile">
          <div className="project-card-mobile__image">
            <motion.div variants={mobileImgVariants} style={{ position: 'absolute', inset: 0 }}>
              <Image
                src={urlFor(project.cardImageDefault).width(800).url()}
                alt={project.title}
                fill
                sizes="(max-width: 600px) 100vw, 50vw"
                className="project-card__img"
              />
            </motion.div>
            <div className="project-card-mobile__tags">
              {project.tags?.map((tag, i) => (
                <span key={i} className="project-card__tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="project-card-mobile__content">
            <div className="project-card__text">
              <h3 className="project-card__title heading-2">{project.title}</h3>
              <p className="project-card__subtitle text-sm">{project.description}</p>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial="rest" whileHover="hover" whileTap="hover">
      <Link href={`/work/${project.slug.current}`} className="project-card">

        <motion.div variants={imgVariants} style={{ position: 'absolute', inset: 0 }}>
          <Image
            src={urlFor(project.cardImageDefault).width(800).url()}
            alt={project.title}
            fill
            sizes="(max-width: 600px) 100vw, 50vw"
            className="project-card__img"
          />
        </motion.div>

        <motion.div className="project-card__blur" aria-hidden="true" variants={overlayVariants}>
          {BLUR_LAYERS.map((layer, i) => (
            <div
              key={i}
              className="project-card__blur-layer"
              style={{
                backdropFilter: `blur(${layer.blur}px)`,
                WebkitBackdropFilter: `blur(${layer.blur}px)`,
                maskImage: layer.mask,
                WebkitMaskImage: layer.mask,
              }}
            />
          ))}
        </motion.div>

        <motion.div className="project-card__scrim" variants={overlayVariants} />

        <motion.div className="project-card__content" variants={contentVariants}>
          <div className="project-card__tags">
            {project.tags?.map((tag, i) => (
              <span key={i} className="project-card__tag">{tag}</span>
            ))}
          </div>
          <div className="project-card__text">
            <h3 className="project-card__title heading-2">{project.title}</h3>
            <p className="project-card__subtitle text-sm">{project.description}</p>
          </div>
        </motion.div>

      </Link>
    </motion.div>
  )
})

export default ProjectCard
