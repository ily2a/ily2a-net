import { sanityFetch } from '@/sanity/lib/live'
import { SITE_URL as BASE_URL } from '@/constants/site'
import { CASE_STUDY_SITEMAP_QUERY } from '@/lib/sanity-queries'

export default async function sitemap() {
  let projects = []
  try {
    const { data } = await sanityFetch({
      query: CASE_STUDY_SITEMAP_QUERY,
    })
    projects = data ?? []
  } catch (e) {
    console.error('[sitemap.js] Sanity fetch failed:', e)
  }

  return [
    {
      url:             BASE_URL,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        1,
    },
    {
      url:             `${BASE_URL}/craft`,
      lastModified:    projects.length
        ? new Date(Math.max(...projects.map(p => new Date(p._updatedAt).getTime())))
        : new Date(),
      changeFrequency: 'monthly',
      priority:        0.9,
    },
    ...projects.map((p) => ({
      url:             `${BASE_URL}/craft/${p.slug}`,
      lastModified:    new Date(p._updatedAt),
      changeFrequency: 'monthly',
      priority:        0.8,
    })),
  ]
}
