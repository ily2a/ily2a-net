'use client'

import { forwardRef } from 'react'
import { m } from 'framer-motion'
import { SPRING_SNAP } from '@/constants/animations'
const baseClass =
  'gradient-button btn-label-flat inline-flex items-center justify-center rounded-[8px] min-w-[132px] px-9 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amethyst-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'

const ContactFormButton = forwardRef(function ContactFormButton(
  { className, children, ...props },
  ref
) {
  return (
    <m.button
      ref={ref}
      className={className ? `${baseClass} ${className}` : baseClass}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAP}
      {...props}
    >
      {children}
    </m.button>
  )
})

ContactFormButton.displayName = 'ContactFormButton'

export { ContactFormButton }
