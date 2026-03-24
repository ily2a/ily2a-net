// Shared GROQ query fragments — import these instead of duplicating inline.

const CASE_STUDY_FIELDS = `
  _id, title, slug, description, tags,
  cardImageDefault { ..., "lqip": asset->metadata.lqip },
  cardImageHover   { ..., "lqip": asset->metadata.lqip }
`

// All case studies, ordered — used on /craft
export const CASE_STUDIES_QUERY = `*[_type == "caseStudy"] | order(order asc) {${CASE_STUDY_FIELDS}}`

// First 4 case studies — used on home page
export const CASE_STUDIES_FEATURED_QUERY = `*[_type == "caseStudy"] | order(order asc) [0...4] {${CASE_STUDY_FIELDS}}`

// Single case study by slug — used on /craft/[slug]
export const CASE_STUDY_BY_SLUG_QUERY = `*[_type == "caseStudy" && slug.current == $slug][0] {
  _id, _updatedAt, title, slug, client, role, timeline, platform, industry, tags, description,
  coverImage { ..., "lqip": asset->metadata.lqip, "url": asset->url, alt },
  brief, problem, goals, uxStrategy,
  body[] {
    ...,
    _type == "image" => { ..., "lqip": asset->metadata.lqip }
  },
  figmaEmbed
}`

// All slugs — used for generateStaticParams
export const CASE_STUDY_SLUGS_QUERY = `*[_type == "caseStudy"] { "slug": slug.current }`
