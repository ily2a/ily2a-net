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
