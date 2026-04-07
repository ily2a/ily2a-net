// Pure helpers for working with Portable Text content. Kept separate from
// the React component definitions in components/PortableTextComponents.js
// so server-only code (sitemaps, metadata) can reach for them without
// pulling React/JSX into a non-render context.

/** Slugifies a heading string into a URL-safe id for in-page anchors. */
export function toId(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * Disambiguates duplicate ids in a list of { id, ... } items by appending
 * an incrementing suffix. Items without an `id` pass through untouched.
 */
export function dedupeIds(items) {
  const seen = {}
  return items.map((item) => {
    const base = item.id
    if (!base) return item
    seen[base] = (seen[base] ?? 0) + 1
    return seen[base] === 1 ? item : { ...item, id: `${base}-${seen[base]}` }
  })
}
