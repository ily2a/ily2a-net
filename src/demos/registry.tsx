'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { DemoId, DemoProps } from './catalog'

// Each demo is its own chunk (code + font), fetched only when LiveDemo
// mounts it, which happens once it nears the viewport. ssr: false because
// demos are interactive-only and never server-rendered.
const loading = () => <div className="skeleton absolute inset-0" />

export const DEMO_COMPONENTS: Record<DemoId, ComponentType<DemoProps>> = {
  'lean-onboarding': dynamic<DemoProps>(() => import('./lean-onboarding'), { ssr: false, loading }),
  'myfridays-donor': dynamic<DemoProps>(() => import('./myfridays'), { ssr: false, loading }),
}
