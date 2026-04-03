'use client'

import { SpeedInsights } from '@vercel/speed-insights/next'

const beforeSend = (event) => event.url.includes('/studio') ? null : event

export default function SpeedInsightsWrapper() {
  return <SpeedInsights beforeSend={beforeSend} />
}
