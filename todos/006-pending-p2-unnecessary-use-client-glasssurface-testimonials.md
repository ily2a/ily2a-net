---
status: pending
priority: p2
issue_id: "006"
tags: [code-review, performance, architecture]
dependencies: []
---

# Unnecessary 'use client' on GlassSurface and TestimonialsSection

## Problem Statement
`GlassSurface.js` and `TestimonialsSection.js` both have `'use client'` directives despite using no hooks, event handlers, or browser APIs. This forces everything that imports them into the client bundle unnecessarily, preventing server-side rendering of content that could be static.

## Findings

- **`src/components/GlassSurface.js` line 1** — pure presentational div wrapper, zero hooks or effects. Imported by Navbar, FloatingNav, and likely others — forces all of them into client boundary unnecessarily.
- **`src/components/TestimonialsSection.js` line 1** — no hooks, no effects. Only client behaviour is a dynamic import of `DarkVeil` which is already lazy-loaded and handles its own client boundary.

## Proposed Solutions

### Option A: Remove 'use client' from both files (Recommended)
Remove the directive from both files. Next.js will automatically make them server components. The dynamic import of `DarkVeil` inside `TestimonialsSection` will still work (dynamic imports can be used in server components for client-only child components).

**Pros:** Reduces client JS bundle, enables SSR of testimonials content
**Effort:** Small
**Risk:** Low — verify no hooks are accidentally present

### Option B: Leave as-is
Accept the extra client bundle cost as negligible for a portfolio site.

**Effort:** None
**Risk:** None
**Cons:** Misses a small SSR opportunity, sets a bad precedent

## Recommended Action
Option A. Before removing, confirm with grep that neither file uses any hook, browser API, or event handler directly.

## Technical Details
- **Affected files:** `src/components/GlassSurface.js`, `src/components/TestimonialsSection.js`

## Acceptance Criteria
- [ ] `'use client'` removed from GlassSurface.js
- [ ] `'use client'` removed from TestimonialsSection.js
- [ ] Both components render correctly in production build (no hydration errors)
- [ ] DarkVeil still loads lazily inside TestimonialsSection

## Work Log
- 2026-03-31: Identified during performance review
