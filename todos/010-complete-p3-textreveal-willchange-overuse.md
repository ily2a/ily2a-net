---
status: complete
priority: p3
issue_id: "010"
tags: [code-review, performance]
dependencies: []
---

# TextReveal: willChange on Every Word Span Creates Too Many Compositor Layers

## Problem Statement

`TextReveal` sets `willChange: 'filter, transform, opacity'` inline on every `<motion.span>`. The hero text has two TextReveal instances — 12 words + 7 words = 19 spans simultaneously promoted to their own compositor layers. On mobile devices, creating that many layers simultaneously can cause GPU memory pressure and actually *hurt* frame rate during the animation.

The `willChange` hint is also never cleared after the animation completes — Framer Motion leaves the inline style in place, keeping all 19 elements in their own layers for the entire page lifetime.

## Findings

- **Location:** [src/components/TextReveal.js:15](src/components/TextReveal.js#L15)
  ```jsx
  style={{ willChange: 'filter, transform, opacity' }}
  ```
- **Instance count:** Hero uses 2 TextReveal components with a combined ~19 words
- **Filter animations:** `filter: blur()` changes are GPU-heavy; promoting every word independently compounds this

## Proposed Solutions

### Option A — Remove `willChange` entirely (Recommended)
Let the browser decide when to promote layers. Modern browsers (including mobile) handle Framer Motion animations well without explicit `willChange` hints. The animations still run smoothly on desktop, and on mobile the reduced memory pressure likely outweighs any missed promotion.

**Pros:** Simpler; lower GPU memory pressure on mobile; no persistent layers
**Cons:** Marginal rendering cost increase on high-end desktop (unnoticeable)
**Effort:** XSmall  **Risk:** None

### Option B — Move `willChange` to the parent `<p>` element
Promote the whole text block as one layer instead of per-word.

**Pros:** One layer instead of 19; still hints the browser
**Cons:** Filter animations on children may still promote individually in some renderers
**Effort:** XSmall  **Risk:** Low

## Recommended Action

_Pending triage_

## Technical Details

- **Affected file:** `src/components/TextReveal.js`

## Acceptance Criteria

- [ ] The number of simultaneously-promoted compositor layers during the hero animation is reduced
- [ ] Hero text animation is visually identical

## Work Log

- 2026-03-28: Identified during full project code review
