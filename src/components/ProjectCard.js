'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { SPRING_CARD } from '@/constants/animations'
import { BREAKPOINTS } from '@/constants/layout'

// 7 blur bands whose masks tile in 12.5% (= 100% / 8) increments so each band
// exposes the next doubling of blur radius. If you add or remove layers, update
// both the blur values AND the mask stop percentages (step = 100 / (n + 1)).
const BLUR_LAYERS = [
  { blur: 0.5, mask: 'linear-gradient(rgba(0,0,0,0) 0%,#000 12.5%,#000 25%,rgba(0,0,0,0) 37.5%)' },
  { blur: 1,   mask: 'linear-gradient(rgba(0,0,0,0) 12.5%,#000 25%,#000 37.5%,rgba(0,0,0,0) 50%)' },
  { blur: 2,   mask: 'linear-gradient(rgba(0,0,0,0) 25%,#000 37.5%,#000 50%,rgba(0,0,0,0) 62.5%)' },
  { blur: 4,   mask: 'linear-gradient(rgba(0,0,0,0) 37.5%,#000 50%,#000 62.5%,rgba(0,0,0,0) 75%)' },
  { blur: 8,   mask: 'linear-gradient(rgba(0,0,0,0) 50%,#000 62.5%,#000 75%,rgba(0,0,0,0) 87.5%)' },
  { blur: 16,  mask: 'linear-gradient(rgba(0,0,0,0) 62.5%,#000 75%,#000 87.5%,#000 100%)' },
  { blur: 32,  mask: 'linear-gradient(rgba(0,0,0,0) 75%,#000 87.5%,#000 100%)' },
].map(({ blur, mask }) => ({
  blur,
  style: {
    backdropFilter:       `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    maskImage:            mask,
    WebkitMaskImage:      mask,
  },
}))

// Blur fades in fast so it's visually established before the text appears.
// backdropFilter requires GPU compositing setup which costs a frame or two,
// so giving it a head-start prevents content from appearing to lead the blur.
const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
}

const contentVariants = {
  rest:  { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.1 } },
}

const imgVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const mobileImgVariants = {
  rest:    { scale: 1 },
  pressed: { scale: 1.03, transition: { duration: 0.2, ease: 'easeOut' } },
}

const hoverImgVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

const mobileHoverImgVariants = {
  rest:    { opacity: 0 },
  pressed: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
}

// Build an optimised Sanity image URL — WebP/AVIF via auto format, capped at 800px wide
const imgUrl = (source) => urlFor(source).width(800).auto('format').url()

const ProjectCard = memo(function ProjectCard({ project }) {
  const width     = useWindowWidth()
  const isCompact = width > 0 && width < BREAKPOINTS.DESKTOP

  if (isCompact) {
    return (
      <motion.article
        initial="rest"
        whileTap="pressed"
        transition={SPRING_CARD}
      >
        <Link href={`/craft/${project.slug.current}`} className="project-card-mobile">
          <div className="project-card-mobile__image">
            <motion.div variants={mobileImgVariants} className="absolute inset-0">
              {project.cardImageDefault && (
                <Image
                  src={imgUrl(project.cardImageDefault)}
                  alt={project.title}
                  fill
                  sizes="(max-width: 600px) 100vw, 50vw"
                  className="project-card__img"
                  placeholder={project.cardImageDefault.lqip ? 'blur' : 'empty'}
                  blurDataURL={project.cardImageDefault.lqip}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </motion.div>
            {project.cardImageHover && (
              <motion.div variants={mobileHoverImgVariants} className="absolute inset-0">
                <Image
                  src={imgUrl(project.cardImageHover)}
                  alt={project.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 600px) 100vw, 50vw"
                  className="project-card__img"
                  placeholder={project.cardImageHover.lqip ? 'blur' : 'empty'}
                  blurDataURL={project.cardImageHover.lqip}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </motion.div>
            )}
            <ul className="project-card-mobile__tags" role="list">
              {project.tags?.map((tag) => (
                <li key={tag} className="project-card__tag">{tag}</li>
              ))}
            </ul>
          </div>
          <div className="project-card-mobile__content">
            <div className="project-card__text">
              <h3 className="project-card__title heading-2">{project.title}</h3>
              <p className="project-card__subtitle text-sm">{project.description}</p>
            </div>
          </div>
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article initial="rest" whileHover="hover" whileTap="hover">
      <Link href={`/craft/${project.slug.current}`} className="project-card">

        <motion.div variants={imgVariants} className="absolute inset-0">
          {project.cardImageDefault && (
            <Image
              src={imgUrl(project.cardImageDefault)}
              alt={project.title}
              fill
              sizes="(max-width: 600px) 100vw, 50vw"
              className="project-card__img"
              placeholder={project.cardImageDefault.lqip ? 'blur' : 'empty'}
              blurDataURL={project.cardImageDefault.lqip}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
        </motion.div>
        {project.cardImageHover && (
          <motion.div variants={hoverImgVariants} className="absolute inset-0">
            <Image
              src={imgUrl(project.cardImageHover)}
              alt={project.title}
              fill
              loading="lazy"
              sizes="(max-width: 600px) 100vw, 50vw"
              className="project-card__img"
              placeholder={project.cardImageHover.lqip ? 'blur' : 'empty'}
              blurDataURL={project.cardImageHover.lqip}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </motion.div>
        )}

        <motion.div className="project-card__blur" aria-hidden="true" variants={overlayVariants}>
          {BLUR_LAYERS.map((layer) => (
            <div
              key={layer.blur}
              className="project-card__blur-layer"
              style={layer.style}
            />
          ))}
        </motion.div>

        <motion.div className="project-card__scrim" variants={overlayVariants} />

        <motion.div className="project-card__content" variants={contentVariants}>
          <ul className="project-card__tags" role="list">
            {project.tags?.map((tag) => (
              <li key={tag} className="project-card__tag">{tag}</li>
            ))}
          </ul>
          <div className="project-card__text">
            <h3 className="project-card__title heading-2">{project.title}</h3>
            <p className="project-card__subtitle text-sm">{project.description}</p>
          </div>
        </motion.div>

      </Link>
    </motion.article>
  )
})

export default ProjectCard
