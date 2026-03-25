---
status: pending
priority: p3
issue_id: "002"
tags: [code-review, architecture, quality]
dependencies: []
---

# Hardcoded Domain `https://ily2a.net` Across Multiple Files

## Problem Statement

The production domain `https://ily2a.net` is hardcoded as a string literal in at least 5 files. If the domain ever changes (custom domain, staging environment, preview URLs), every occurrence must be found and updated manually.

## Findings

Occurrences found:
- `src/app/craft/[slug]/page.js` — lines 45, 49, 197, 198, 200 (canonical URL, OG url, JSON-LD url/author)
- `src/app/craft/page.js` — OG url
- `src/app/layout.js` — Person schema `url`
- `src/app/sitemap.js` — already uses a `BASE_URL` constant (good!)

Note: `sitemap.js` already does this correctly with a `BASE_URL` constant — the fix is to apply that same pattern everywhere else.

## Proposed Solutions

### Option A: Extend existing `BASE_URL` pattern (Recommended — Small effort)

`sitemap.js` already defines `BASE_URL`. Move it to a shared config file:

```js
// src/lib/site-config.js (or src/constants/site.js)
export const SITE_URL = 'https://ily2a.net'
export const SITE_NAME = 'Ily Ameur'
```

Import `SITE_URL` in `layout.js`, `craft/page.js`, `craft/[slug]/page.js`, and `sitemap.js`.

**Pros:** DRY, single source of truth, consistent with existing pattern.
**Cons:** One extra import per file.
**Effort:** Small. **Risk:** None.

### Option B: Use Next.js `NEXT_PUBLIC_SITE_URL` env var

Set via `.env.local` and `vercel.json`. Useful if you need staging/preview URLs to be different.

**Pros:** Environment-aware.
**Cons:** More infrastructure setup, overkill for a personal site.
**Effort:** Medium. **Risk:** Low.

## Recommended Action

_To be filled during triage._

## Technical Details

- **Affected files:** `src/app/craft/[slug]/page.js`, `src/app/craft/page.js`, `src/app/layout.js`, `src/app/sitemap.js`
- **Affected components:** `generateMetadata`, `CaseStudyPage`, root layout JSON-LD, sitemap
- **Database changes:** None

## Acceptance Criteria

- [ ] `https://ily2a.net` appears in exactly one place as a constant definition
- [ ] All other files import and use that constant
- [ ] `sitemap.js` also migrates its local `BASE_URL` to the shared constant

## Work Log

- 2026-03-25: Found during code review.

## Resources

- `src/app/sitemap.js` — existing `BASE_URL` pattern to follow
