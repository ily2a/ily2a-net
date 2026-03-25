---
status: pending
priority: p3
issue_id: "004"
tags: [code-review, seo, performance]
dependencies: []
---

# `/craft` Sitemap `lastModified` Always Reports Build Time

## Problem Statement

The `/craft` listing page in `sitemap.js` uses `new Date()` as its `lastModified` value. This means every build reports the page as "modified right now", even when no content changed. Search engines use `lastModified` to prioritize recrawling — constant churn on this field makes the hint meaningless and may cause unnecessary recrawls.

## Findings

**Location:** `src/app/sitemap.js`

```js
{
  url:             `${BASE_URL}/craft`,
  lastModified:    new Date(),   // ← always "now"
  changeFrequency: 'monthly',
  priority:        0.9,
},
```

The case study individual pages correctly use `new Date(p._updatedAt)` from Sanity data.

The `/craft` listing page is semantically "last modified when any case study was last modified" — i.e., `Math.max` of all `_updatedAt` timestamps.

## Proposed Solutions

### Option A: Use the most recent case study `_updatedAt` (Recommended — Small effort)

```js
const mostRecent = projects.reduce((max, p) =>
  new Date(p._updatedAt) > max ? new Date(p._updatedAt) : max,
  new Date(0)
)

{
  url:             `${BASE_URL}/craft`,
  lastModified:    mostRecent,
  changeFrequency: 'monthly',
  priority:        0.9,
},
```

`projects` is already fetched above (used for case study URLs), so no extra query needed.

**Pros:** Accurate signal to search engines. Stable across builds when content hasn't changed.
**Cons:** Minimal extra code.
**Effort:** Small. **Risk:** None.

### Option B: Use a fixed date or leave as `new Date()`

Acceptable for a small personal site — Google largely ignores `lastModified` anyway.

**Pros:** Zero effort.
**Cons:** Inaccurate metadata, technically incorrect.

## Recommended Action

_To be filled during triage._

## Technical Details

- **Affected files:** `src/app/sitemap.js`
- **Affected components:** Sitemap generation
- **Database changes:** None

## Acceptance Criteria

- [ ] `/craft` `lastModified` reflects when content last actually changed
- [ ] Sitemap output is stable between builds when no content changes

## Work Log

- 2026-03-25: Found during code review.

## Resources

- [Next.js sitemap docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google: sitemaps lastmod usage](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)
