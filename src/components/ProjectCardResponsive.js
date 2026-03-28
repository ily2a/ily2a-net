'use client'

import { useWindowWidth } from '@/hooks/useWindowWidth'
import ProjectCard from '@/components/ProjectCard'
import ProjectCardMobile from '@/components/ProjectCardMobile'
import { BREAKPOINTS } from '@/constants/layout'

// Renders only one card variant — avoids the dual-DOM pattern where both
// ProjectCard and ProjectCardMobile were mounted simultaneously, doubling
// image requests. Defaults to mobile (width === 0) on SSR/hydration so the
// server snapshot matches, then re-renders with the correct variant.
export default function ProjectCardResponsive({ project }) {
  const width = useWindowWidth()
  return width >= BREAKPOINTS.TAB
    ? <ProjectCard project={project} />
    : <ProjectCardMobile project={project} />
}
