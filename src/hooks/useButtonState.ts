'use client'

import { useState } from 'react'

export type ButtonState = 'default' | 'hover' | 'pressed'

export interface ButtonStateHandlers {
  onHoverStart: () => void
  onHoverEnd: () => void
  onTapStart: () => void
  onTap: () => void
  onTapCancel: () => void
}

/**
 * Shared button state machine used across all interactive buttons.
 * Handles default / hover / pressed states with Framer Motion event handlers.
 *
 * @param options.isMobile — disables hover state on touch devices
 */
export function useButtonState({ isMobile = false }: { isMobile?: boolean } = {}): {
  state: ButtonState
  handlers: ButtonStateHandlers
} {
  const [state, setState] = useState<ButtonState>('default')

  const handlers: ButtonStateHandlers = {
    onHoverStart:  () => { if (!isMobile) setState('hover') },
    onHoverEnd:    () => setState('default'),
    onTapStart:    () => setState('pressed'),
    onTap:         () => setState(isMobile ? 'default' : 'hover'),
    onTapCancel:   () => setState('default'),
  }

  return { state, handlers }
}
