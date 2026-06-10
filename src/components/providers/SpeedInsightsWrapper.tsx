'use client'

import { SpeedInsights } from '@vercel/speed-insights/next'
import type { ComponentProps } from 'react'

type BeforeSend = NonNullable<ComponentProps<typeof SpeedInsights>['beforeSend']>

const beforeSend: BeforeSend = (event) => {
  try {
    const { pathname } = new URL(event.url)
    return pathname.startsWith('/studio') ? null : event
  } catch {
    return event
  }
}

export default function SpeedInsightsWrapper() {
  return <SpeedInsights beforeSend={beforeSend} />
}
