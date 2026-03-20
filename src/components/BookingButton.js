'use client'

import { getCalApi } from '@calcom/embed-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CloseButton from '@/components/CloseButton'
import { useWindowWidth } from '@/hooks/useWindowWidth'

export default function BookingButton() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState('default')
  const [mounted, setMounted] = useState(false)

  const width = useWindowWidth()
  const isMobile = width > 0 && width < 810
  const isTablet = width >= 810 && width < 1200

  useEffect(() => {
    setMounted(true)
    ;(async function () {
      try {
        const cal = await getCalApi()
        cal('ui', {
          theme: 'dark',
          cssVarsPerTheme: {
            dark: {
              'cal-brand':          '#b2adc7',
              'cal-brand-emphasis': '#cbc9da',
              'cal-bg':             '#151A1E',
              'cal-bg-subtle':      '#0D1012',
              'cal-border':         '#36414A',
              'cal-text':           '#F3F5F6',
              'cal-text-subtle':    '#6B8494',
            }
          },
          hideEventTypeDetails: false,
          layout: 'month_view',
        })
      } catch {
        // Cal.com failed to load — button still renders, modal just won't work
      }
    })()
  }, [])

  const innerStyles = {
    default: {
      background: 'linear-gradient(to bottom, #f6f6f9, #9c95b6)',
      border: '1px solid #eeecf3',
      boxShadow: 'none',
    },
    hover: {
      background: 'linear-gradient(to bottom, #F3F5F6, #cbc9da)',
      border: '1px solid #cbc9da',
      boxShadow: 'none',
    },
    pressed: {
      background: 'linear-gradient(to bottom, #F3F5F6, #eeecf3)',
      border: '1px solid #b2adc7',
      boxShadow: 'inset 0px 3px 3px #b2adc7, inset 0px -3px 3px #b2adc7, inset -3px 0px 3px #b2adc7, inset 3px 0px 3px #b2adc7',
    },
  }

  const isSmall = isMobile || isTablet

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(21, 26, 30, 0.50)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    ...(isSmall && {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px 20px' : '16px 40px',
    }),
  }

  const frameStyle = isSmall ? {
    position: 'relative',
    width: '100%',
    maxWidth: '860px',
    height: 'calc(100vh - 128px)',
    maxHeight: '800px',
    background: 'transparent',
    border: '1px solid var(--color-brand)',
    borderRadius: '8px',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  } : {
    position: 'absolute',
    top: '64px',
    bottom: '64px',
    left: '160px',
    right: '160px',
    background: 'transparent',
    border: '1px solid var(--color-brand)',
    borderRadius: '8px',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  }

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
          style={backdropStyle}
        >
          <motion.div
            key="frame"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
            style={frameStyle}
          >
            <div style={{
              position: 'absolute',
              top: '16px',
              zIndex: 10,
              ...(isMobile ? { right: '16px' } : { left: '16px' }),
            }}>
              <CloseButton onClick={() => setOpen(false)} />
            </div>
            <iframe
              src="https://cal.com/ily2a/intro?embed=true"
              width="100%"
              height="100%"
              style={{ marginBottom: '-60px', height: 'calc(100% + 80px)', border: 'none' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 30,
          mass: 1,
          delay: 6,
        }}
        onClick={() => setOpen(true)}
        onHoverStart={() => setState('hover')}
        onHoverEnd={() => setState('default')}
        onTapStart={() => setState('pressed')}
        onTap={() => setState('hover')}
        onTapCancel={() => setState('default')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          width: '140px',
          height: '60px',
          borderRadius: '8px',
          background: 'rgba(211, 209, 224, 0.25)',
          cursor: 'pointer',
        }}
      >
        <motion.div
          animate={innerStyles[state]}
          transition={{ type: 'spring', stiffness: 2000, damping: 110, mass: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '8px',
          }}
        >
          <span className="btn-label" style={{ color: '#0d1012', whiteSpace: 'nowrap' }}>
            Book a call
          </span>
        </motion.div>
      </motion.div>

      {mounted && createPortal(overlay, document.body)}
    </>
  )
}
