'use client'

import { createContext, useContext } from 'react'
import type { DemoDevice } from './catalog'

/** The frame a demo is showing in. Set by DeviceFrame around every demo. */
export const DemoDeviceContext = createContext<DemoDevice>('browser')

/**
 * Phones have no hover, so a demo's hover effects run only in the browser
 * frame, even when someone views the phone layout with a mouse. Tailwind
 * classes get the same rule from the `demo-hover:` variant (globals.css).
 */
export const useCanHover = () => useContext(DemoDeviceContext) === 'browser'
