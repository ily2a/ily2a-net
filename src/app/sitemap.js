import { sanityFetch } from '@/sanity/lib/live'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ily2a.net'

export default async function sitemap() {
  const { data: projects } = await sanityFetch({
    query: `*[_type == "caseStudy"] { "slug": slug.current, _updatedAt }`,
  })

  return [
    {
      url:             BASE_URL,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        1,
    },
    ...projects.map((p) => ({
      url:             `${BASE_URL}/craft/${p.slug}`,
      lastModified:    new Date(p._updatedAt),
      changeFrequency: 'monthly',
      priority:        0.8,
    })),
  ]
}
