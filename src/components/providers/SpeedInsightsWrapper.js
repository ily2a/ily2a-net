'use client'

import { SpeedInsights } from '@vercel/speed-insights/next'

const beforeSend = (event) => {
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
