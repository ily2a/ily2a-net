---
status: pending
priority: p3
issue_id: "014"
tags: [code-review, quality]
dependencies: []
---

# Hardcoded Metadata Description String Repeated Multiple Times

## Problem Statement
The site description string appears verbatim in `metadata.description`, `metadata.openGraph.description`, and `metadata.twitter.description` in `layout.js`, and again in `craft/page.js`. Updating the description requires changes in multiple places.

## Findings

- **`src/app/layout.js` lines 25, 28, 37** — description repeated 3 times
- **`src/app/craft/page.js` lines 11–12** — similar hardcoded description
- `SITE_NAME` and `SITE_URL` are already extracted to `src/constants/site.js` — the description should follow the same pattern

## Proposed Solutions

### Option A: Add SITE_DESCRIPTION to src/constants/site.js
```js
// src/constants/site.js
export const SITE_DESCRIPTION = 'I design systems, flows and products. Then build them...';
```
Import in `layout.js` and `craft/page.js`.

**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — consistent with existing constants pattern.

## Technical Details
- **Affected files:** `src/constants/site.js`, `src/app/layout.js`, `src/app/craft/page.js`

## Acceptance Criteria
- [ ] `SITE_DESCRIPTION` constant added to `src/constants/site.js`
- [ ] All description fields in metadata reference the constant
- [ ] Metadata output unchanged

## Work Log
- 2026-03-31: Identified during code quality review
