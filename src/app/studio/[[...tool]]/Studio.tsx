'use client'

// The client-component entry skips the core.sanity-cdn.com bridge script that
// `next-sanity/studio` injects. The bridge only works when Sanity's dashboard
// frames the Studio, and our Studio CSP sets frame-ancestors 'self'.
import { NextStudio } from 'next-sanity/studio/client-component'
import config from '../../../../sanity.config'

export default function Studio() {
  return <NextStudio config={config} />
}
