'use client'

import { useState } from 'react'

/**
 * Shared button state machine used across all interactive buttons.
 * Handles default / hover / pressed states with Framer Motion event handlers.
 *
 * @param {object} options
 * @param {boolean} options.isMobile — disables hover state on touch devices
 */
export function useButtonState({ isMobile = false } = {}) {
  const [state, setState] = useState('default')

  const handlers = {
    onHoverStart:  () => !isMobile && setState('hover'),
    onHoverEnd:    () => setState('default'),
    onTapStart:    () => setState('pressed'),
    onTap:         () => setState(isMobile ? 'default' : 'hover'),
    onTapCancel:   () => setState('default'),
  }

  return { state, handlers }
}
