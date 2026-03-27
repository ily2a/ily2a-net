---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, security, architecture]
dependencies: []
---

# isPasswordProtected field has zero access-control enforcement

## Problem Statement

The Sanity `caseStudy` schema has an `isPasswordProtected` boolean field whose description reads:
> "Hide this case study from the public — only accessible via direct link with password"

However, **no enforcement exists anywhere in the codebase**. A case study marked as password-protected is fully accessible:

- `generateStaticParams` generates a static page for it
- `CASE_STUDY_BY_SLUG_QUERY` fetches it without filtering on `isPasswordProtected`
- `CASE_STUDY_SLUGS_QUERY` includes it in the sitemap slug list
- `src/app/craft/[slug]/page.js` renders it without any gate check

This creates a false sense of security — content you believe is hidden is publicly accessible.

## Findings

- **Schema field**: `src/sanity/schemaTypes/caseStudy.js:116-123` — field defined, `initialValue: false`
- **Page**: `src/app/craft/[slug]/page.js:19-25` — `getCaseStudy()` fetches by slug with no `isPasswordProtected` filter
- **Static params**: `src/app/craft/[slug]/page.js:28-35` — generates params for ALL case studies
- **Queries**: `src/lib/sanity-queries.js:27-28` — `CASE_STUDY_SLUGS_QUERY` includes no filter
- **Sitemap**: `src/app/sitemap.js:7-13` — fetches all slugs, password-protected ones will appear in sitemap

## Proposed Solutions

### Option A — Remove the field (Recommended if unused)
Delete `isPasswordProtected` from the schema. If no case studies are currently marked, this is the simplest fix. It removes the false promise without breaking anything.

- **Pros**: No dead code, no misleading field, zero risk
- **Cons**: If you ever need this feature you'll have to re-add it
- **Effort**: Small
- **Risk**: Low

### Option B — Implement server-side enforcement
Filter password-protected case studies out of public routes:
1. Add `&& !isPasswordProtected` to `CASE_STUDY_SLUGS_QUERY` and `CASE_STUDY_BY_SLUG_QUERY`
2. Call `notFound()` in the page if `data.isPasswordProtected === true` (until a real password UI is built)
3. Remove them from the sitemap

- **Pros**: Fulfills the field's intent, at least hides the content from the public
- **Cons**: No actual password UI — protected studies are just 404s for now
- **Effort**: Small
- **Risk**: Low

### Option C — Full password-gate implementation
Implement an actual password-check UI: server action or API route that validates a submitted password against an env var, sets a short-lived cookie/session, and redirects to the case study.

- **Pros**: Fulfills the feature completely
- **Cons**: Significant complexity for a portfolio site; cookies/sessions add surface area
- **Effort**: Large
- **Risk**: Medium

## Recommended Action

Option A if no case studies are currently marked as protected. Option B as a quick fix if any are. Option C only if NDA-protected work must be gated behind a real password.

## Technical Details

- **Affected files**: `src/sanity/schemaTypes/caseStudy.js`, `src/lib/sanity-queries.js`, `src/app/craft/[slug]/page.js`, `src/app/sitemap.js`
- **No database changes** for Option A/B

## Acceptance Criteria

- [ ] No case study marked `isPasswordProtected: true` is publicly reachable via its slug URL
- [ ] No such case study appears in the sitemap
- [ ] `generateStaticParams` does not generate a page for it
- [ ] OR the field is removed and there are no case studies relying on it

## Work Log

- 2026-03-27: Found during full project code review — field has no enforcement at any layer.

## Resources

- Schema: `src/sanity/schemaTypes/caseStudy.js:116-123`
- Page route: `src/app/craft/[slug]/page.js`
- Queries: `src/lib/sanity-queries.js`
