'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'
import { SPRING_CARD } from '@/constants/animations'

const MotionLink = motion.create(Link)

const imgVariants = {
  rest:    { scale: 1 },
  pressed: { scale: 1.03, transition: { duration: 0.2, ease: 'easeOut' } },
}

const hoverImgVariants = {
  rest:    { opacity: 0 },
  pressed: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
}

const imgUrl = (source) => urlFor(source).width(800).auto('format').url()

const ProjectCardMobile = memo(function ProjectCardMobile({ project }) {
  return (
    <MotionLink
      href={`/craft/${project.slug.current}`}
      initial="rest"
      whileTap="pressed"
      transition={SPRING_CARD}
      style={{ touchAction: 'manipulation' }}
      className="project-card-mobile"
    >
      <div className="project-card-mobile__image">
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
    </MotionLink>
  )
})

export default ProjectCardMobile
