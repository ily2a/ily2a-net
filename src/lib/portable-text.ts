// Pure helpers for working with Portable Text content. Kept separate from
// the React component definitions in components/portable-text/PortableTextComponents.tsx
// so server-only code (sitemaps, metadata) can reach for them without
// pulling React/JSX into a non-render context.

/** Slugifies a heading string into a URL-safe id for in-page anchors. */
export function toId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * Disambiguates duplicate ids in a list of { id, ... } items by appending
 * an incrementing suffix. Items without an `id` pass through untouched.
 *
 * The suffixed candidate is re-checked against every id already emitted (not
 * just the base count), so a generated id can never collide with a later
 * natural id: e.g. ['foo','foo','foo-2'] → ['foo','foo-2','foo-3'] rather than
 * a duplicate 'foo-2'. Without this, two headings could share a DOM id and the
 * ToC anchor would scroll to the wrong one.
 */
export function dedupeIds<T extends { id?: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.map((item) => {
    const base = item.id
    if (!base) return item
    if (!seen.has(base)) {
      seen.add(base)
      return item
    }
    let n = 2
    let candidate = `${base}-${n}`
    while (seen.has(candidate)) candidate = `${base}-${++n}`
    seen.add(candidate)
    return { ...item, id: candidate }
  })
}
