// These three values are intentionally public — they identify the Sanity project
// and dataset but grant no write access on their own. API tokens (read/write)
// must use non-NEXT_PUBLIC env vars so they are never included in the bundle.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-13'

export const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
