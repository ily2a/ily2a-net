---
status: pending
priority: p3
issue_id: "001"
tags: [code-review, architecture, sanity]
dependencies: []
---

# 001 · `isPasswordProtected` field has no enforcement

## Problem Statement

The Sanity `caseStudy` schema ([src/sanity/schemaTypes/caseStudy.js](../src/sanity/schemaTypes/caseStudy.js)) defines an `isPasswordProtected` boolean field described as *"Hide this case study from the public — only accessible via direct link with password"*. However, neither the GROQ queries nor the case study page check this field. A document saved with `isPasswordProtected: true` in Studio is still fully publicly accessible at `/craft/[slug]`.

**Why it matters:** A content editor marking a case study as "password protected" in Studio will believe it is protected. It is not — the flag is silently ignored, creating a false sense of security.

## Findings

- **Schema field** ([src/sanity/schemaTypes/caseStudy.js:87](../src/sanity/schemaTypes/caseStudy.js)): field declared with description promising password protection.
- **GROQ queries** ([src/lib/sanity-queries.js](../src/lib/sanity-queries.js)): `CASE_STUDIES_QUERY`, `CASE_STUDIES_FEATURED_QUERY`, and `CASE_STUDY_BY_SLUG_QUERY` all return the document regardless of `isPasswordProtected`.
- **Case study page** ([src/app/craft/[slug]/page.js](../src/app/craft/%5Bslug%5D/page.js)): no check for the field; `notFound()` is only called when the document doesn't exist at all.
- **`generateStaticParams`**: pre-renders *all* slugs, including protected ones.

## Proposed Solutions

### Option A — Enforce via GROQ filter (Recommended)
Add `&& isPasswordProtected != true` to all public-facing GROQ queries. Protected case studies become 404s.

**Pros:** Zero client-side exposure. Simple, idiomatic Sanity approach.
**Cons:** No actual "password" feature — just hides. If the slug is known, it 404s rather than prompting for a password.
**Effort:** Small | **Risk:** Low

### Option B — Implement a real password gate
Add a password field to the schema. On the page, if `isPasswordProtected` is true, render a password form. Validate against the stored password server-side.

**Pros:** Matches the description ("accessible via direct link with password").
**Cons:** Storing passwords in Sanity requires hashing; significant complexity for a portfolio.
**Effort:** Large | **Risk:** Medium

### Option C — Remove the field
Delete `isPasswordProtected` from the schema. If protection is ever needed, implement it properly then.

**Pros:** No misleading UI in Studio.
**Cons:** Loses the affordance entirely.
**Effort:** Small | **Risk:** Low

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected files:** `src/sanity/schemaTypes/caseStudy.js`, `src/lib/sanity-queries.js`, `src/app/craft/[slug]/page.js`, `src/app/craft/page.js`, `src/app/page.js`
- **Simplest fix:** Add `&& isPasswordProtected != true` filter to all three public GROQ queries and exclude protected slugs from `generateStaticParams`.

## Acceptance Criteria

- [ ] A document with `isPasswordProtected: true` does not appear in project listings
- [ ] Navigating directly to `/craft/[protected-slug]` returns a 404 (or a password prompt if Option B)
- [ ] Studio clearly communicates the behaviour to content editors

## Work Log

- **2026-03-29** — Found during whole-project code review. Field exists in schema since initial Sanity setup but was never wired up on the frontend.

## Resources

- Schema: [src/sanity/schemaTypes/caseStudy.js](../src/sanity/schemaTypes/caseStudy.js)
- Queries: [src/lib/sanity-queries.js](../src/lib/sanity-queries.js)
- Page: [src/app/craft/[slug]/page.js](../src/app/craft/%5Bslug%5D/page.js)
