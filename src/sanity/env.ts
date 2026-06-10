// These three values are intentionally public — they identify the Sanity project
// and dataset but grant no write access on their own. API tokens (read/write)
// must use non-NEXT_PUBLIC env vars so they are never included in the bundle.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-13'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}
