// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { client } from './client'

const { sanityFetch: baseSanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: false,
});

export { SanityLive }

// Inject a stable 'sanity' cache tag on every fetch. The publish webhook
// (src/app/api/revalidate/route.ts) calls revalidateTag('sanity'); without this
// tag, defineLive only attaches per-query `sanity:<hash>` sync tags, which the
// webhook's literal 'sanity' never matches — so published content would never
// revalidate in production until a redeploy. Callers may still pass their own
// `tags`, which are merged in.
export const sanityFetch = ((options: Parameters<typeof baseSanityFetch>[0]) =>
  baseSanityFetch({ ...options, tags: ['sanity', ...(options.tags ?? [])] })
) as typeof baseSanityFetch

// Typed convenience over sanityFetch for collection queries that should degrade
// to an empty list (never throw) on a transient Sanity failure. Owns the single
// unavoidable cast — GROQ string queries are typed `any` — and the error log, so
// call sites don't each re-implement try/catch + cast.
export async function fetchSanityList<T>(
  label: string,
  query: string,
  params?: Record<string, unknown>,
): Promise<T[]> {
  try {
    const { data } = await sanityFetch({ query, params })
    return (data ?? []) as T[]
  } catch (e) {
    console.error(`[${label}] Sanity fetch failed:`, e)
    return []
  }
}
