---
status: complete
priority: p3
issue_id: "011"
tags: [code-review, architecture, content]
dependencies: []
---

# TestimonialsSection: Content Hardcoded in Component Instead of Sanity CMS

## Problem Statement

All four testimonials (name, role, avatar path, quote, layout flag) are hardcoded in `TestimonialsSection.js`. Updating a testimonial, adding a new one, or reordering them requires a code change and a production deployment — even though the site already has Sanity CMS for exactly this kind of content.

## Findings

- **Location:** [src/components/TestimonialsSection.js:13-46](src/components/TestimonialsSection.js#L13-L46)
  ```js
  const TESTIMONIALS = [
    { name: 'Ali Abdulkadir Ali', role: 'CPO @ Shamaazi', avatar: '/Avatars/ali.jpg', quote: '...', wide: true },
    ...
  ]
  ```
- Avatar images are stored in `/public/Avatars/` — also not in the CDN
- The `wide: true/false` layout flag is editorial metadata that belongs in the CMS

## Proposed Solutions

### Option A — Move testimonials to Sanity CMS (Recommended)
Create a `testimonial` document type in Sanity. Fetch with `sanityFetch`. Store avatars in Sanity assets (CDN delivery, automatic LQIP blur placeholders like project card images).

**Pros:** Content editable without deploy; consistent with how projects are managed; CDN avatar delivery; LQIP blurs
**Cons:** Requires schema work + Sanity Studio data entry
**Effort:** Medium  **Risk:** Low

### Option B — Keep hardcoded, move to a data file
Extract to `src/data/testimonials.js` or `src/constants/testimonials.js` so it's clear it's content, not component logic.

**Pros:** Slightly cleaner component; zero infrastructure change
**Cons:** Still requires a deploy to update
**Effort:** XSmall  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected file:** `src/components/TestimonialsSection.js`
- **New file if Option A:** `src/sanity/schemaTypes/testimonial.js`

## Acceptance Criteria

### If Option A:
- [ ] Testimonial documents exist in Sanity with name, role, avatar, quote, wide fields
- [ ] `TestimonialsSection` fetches and renders live data
- [ ] Avatar images served from Sanity CDN with LQIP blur placeholder

### If Option B:
- [ ] `TESTIMONIALS` array lives in a dedicated data/constants file, not inline in the component

## Work Log

- 2026-03-28: Identified during full project code review
