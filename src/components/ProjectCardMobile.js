'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/lib/image'

const imgUrl = (source) => urlFor(source).width(800).auto('format').url()

const ProjectCardMobile = memo(function ProjectCardMobile({ project }) {
  return (
    <Link href={`/craft/${project.slug.current}`} className="project-card-mobile">
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="project-card-mobile__image">
          <div className="absolute inset-0">
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
          </div>
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
      </motion.div>
    </Link>
  )
})

export default ProjectCardMobile
