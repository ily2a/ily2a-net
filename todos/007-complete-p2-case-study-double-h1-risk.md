---
status: complete
priority: p2
issue_id: "007"
tags: [code-review, seo, accessibility, quality]
dependencies: []
---

# Case Study Page: Double h1 Risk from PortableText Body

## Problem Statement

The case study page renders an `<h1>` for the project title (line 255). The `ptBody` PortableText components also register an `h1` block type renderer (line 102). If a content author adds an h1 heading anywhere in the case study body, the page will have two `<h1>` elements — invalid HTML, bad for SEO, and confusing for screen readers which use the h1 as the document landmark.

## Findings

- **Page h1:** [src/app/craft/[slug]/page.js:255](src/app/craft/%5Bslug%5D/page.js#L255)
  ```jsx
  <h1 className="heading-page text-text-primary">{data.title}</h1>
  ```
- **PortableText h1 renderer:** [src/app/craft/[slug]/page.js:102-105](src/app/craft/%5Bslug%5D/page.js#L102-L105)
  ```jsx
  h1: ({ children, value }) => {
    const text = value?.children?.map(c => c.text).join('') ?? ''
    return <h1 id={toId(text)} className="heading-display text-brand scroll-mt-10">{children}</h1>
  },
  ```
- **Schema concern:** The `caseStudy.js` Sanity schema likely allows h1 in the body block; this is the root cause

## Proposed Solutions

### Option A — Remove h1 from ptBody renderer (Recommended)
Change the `h1` block type in `ptBody` to render as `<h2>` instead, or remove it entirely and let Sanity's block type fall through to the default `<p>` renderer.

**Pros:** Immediate fix; no schema change needed
**Cons:** Any existing h1 content in Sanity body becomes h2 visually (usually a non-issue; h1 in body is bad practice anyway)
**Effort:** XSmall  **Risk:** None

### Option B — Remove h1 from Sanity schema allowed styles
Edit `src/sanity/schemaTypes/caseStudy.js` to exclude `h1` from the `body` field's allowed block styles.

**Pros:** Prevents the problem at authoring time
**Cons:** Doesn't fix existing content if any h1 blocks already exist in the CMS
**Effort:** XSmall  **Risk:** None

### Option C — Both A and B
Belt and suspenders: remove h1 from schema AND change the renderer to output h2 as fallback.

**Pros:** Prevents both new and existing data from causing the issue
**Cons:** Slightly more work
**Effort:** Small  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected files:** `src/app/craft/[slug]/page.js`, `src/sanity/schemaTypes/caseStudy.js`
- **SEO impact:** Multiple h1 elements confuse crawlers and violate HTML spec (one h1 per page)
- **a11y impact:** Screen reader users navigate by heading hierarchy; two h1s breaks the document outline

## Acceptance Criteria

- [ ] No page in the site ever renders more than one `<h1>` element
- [ ] h1 content in Sanity body either degrades gracefully to h2 or is blocked at schema level

## Work Log

- 2026-03-28: Identified during full project code review
