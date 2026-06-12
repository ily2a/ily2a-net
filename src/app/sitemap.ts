import type { MetadataRoute } from 'next'
import { fetchSanityList } from '@/sanity/lib/live'
import { SITE_URL as BASE_URL } from '@/constants/site'
import { CASE_STUDY_SITEMAP_QUERY } from '@/lib/sanity-queries'

interface SitemapEntry {
  slug: string
  _updatedAt: string
}

// Stable fallback for the home and /craft index entries. Using `new Date()` at
// build time made these timestamps jitter on every deploy even when nothing
// changed, which added noise to crawler revalidation signals. The constant
// is bumped when the surrounding site structure changes meaningfully.
const SITE_LAST_MODIFIED = new Date('2026-04-08T00:00:00Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await fetchSanityList<SitemapEntry>('sitemap.ts', CASE_STUDY_SITEMAP_QUERY)

  const craftLastModified = projects.length
    ? new Date(Math.max(...projects.map(p => new Date(p._updatedAt).getTime())))
    : SITE_LAST_MODIFIED

  return [
    {
      url:             BASE_URL,
      lastModified:    SITE_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority:        1,
    },
    {
      url:             `${BASE_URL}/craft`,
      lastModified:    craftLastModified,
      changeFrequency: 'monthly',
      priority:        0.9,
    },
    ...projects.map((p) => ({
      url:             `${BASE_URL}/craft/${p.slug}`,
      lastModified:    new Date(p._updatedAt),
      changeFrequency: 'monthly' as const,
      priority:        0.8,
    })),
  ]
}
