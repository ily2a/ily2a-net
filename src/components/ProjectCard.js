'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'

const MotionLink = motion.create(Link)

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

const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
}

const contentVariants = {
  rest:  { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.1 } },
}

const hoverImgVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

const imgUrl = (source) => urlFor(source).width(800).auto('format').url()

// Single CSS-responsive card — no JS branching, no hydration CLS.
// Desktop (tab: 730px+): plain image, all info revealed on hover with blur overlay.
// Mobile (below tab): image with tags inside + title/subtitle below, slight tap scale.
//
// Tap scale is CSS-only via @media (hover: none) so it only fires on touch devices,
// avoiding any conflict between backdrop-filter and CSS transforms on desktop.
const ProjectCard = memo(function ProjectCard({ project }) {
  return (
    <MotionLink
      href={`/craft/${project.slug.current}`}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ touchAction: 'manipulation' }}
      className="project-card block no-underline"
    >
      {/* ── Image + overlay container ── */}
      <div className="relative aspect-[16/10] w-full">

        {/* Image wrapper */}
        <div className="project-card__image-wrap absolute inset-0 rounded-xl overflow-hidden">
          {/* Default image */}
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

          {/* Hover image — desktop only */}
          {project.cardImageHover && (
            <motion.div variants={hoverImgVariants} className="absolute inset-0 hidden tab:block">
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
        </div>

        {/* Desktop: blur/scrim overlay — sibling of image, never scaled */}
        <div className="hidden tab:block absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <motion.div className="project-card__blur" aria-hidden="true" variants={overlayVariants}>
            {BLUR_LAYERS.map((layer) => (
              <div key={layer.blur} className="project-card__blur-layer" style={layer.style} />
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
              <p className="project-card__subtitle font-normal tracking-[0.07em] leading-[150%] text-[14px] md:text-[16px] xl:text-[20px] text-balance">{project.description}</p>
            </div>
          </motion.div>
        </div>

        {/* Mobile: tags pinned inside image at bottom — hidden on desktop */}
        <ul className="tab:hidden absolute bottom-3 left-3 right-3 flex gap-[6px] flex-wrap z-[2] list-none p-0 m-0" role="list">
          {project.tags?.map((tag) => (
            <li key={tag} className="project-card__tag">{tag}</li>
          ))}
        </ul>

      </div>

      {/* ── Mobile: title + subtitle below image — hidden on desktop ── */}
      <div className="tab:hidden pt-[10px] px-1 pb-0 flex flex-col gap-2">
        <h3 className="project-card__title heading-2">{project.title}</h3>
        <p className="project-card__subtitle font-normal tracking-[0.07em] leading-[150%] text-[14px] md:text-[16px] xl:text-[20px] text-balance">{project.description}</p>
      </div>

    </MotionLink>
  )
})

export default ProjectCard
