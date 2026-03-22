'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const contactFormButtonVariants = cva(
  [
    'gradient-button',
    'inline-flex items-center justify-center',
    'rounded-[8px] min-w-[132px] px-9 py-4',
    'text-base font-bold leading-none',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: '',
        variant: 'gradient-button-variant',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const ContactFormButton = forwardRef(function ContactFormButton(
  { className, variant, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      className={cn(contactFormButtonVariants({ variant, className }))}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {children}
    </motion.button>
  )
})

ContactFormButton.displayName = 'ContactFormButton'

export { ContactFormButton, contactFormButtonVariants }
