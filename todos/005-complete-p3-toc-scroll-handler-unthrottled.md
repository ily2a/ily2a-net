---
status: pending
priority: p3
issue_id: "005"
tags: [code-review, performance, quality]
dependencies: []
---

# 005 · TableOfContents scroll handler fires on every scroll event

## Problem Statement

`TableOfContents` attaches a `scroll` listener to `window` that calls `getBoundingClientRect()` on every heading element on every scroll event. While `{ passive: true }` prevents jank, the repeated DOM reads still occur more frequently than needed on fast scrolls.

## Findings

- **Location:** [src/components/TableOfContents.js:8-20](../src/components/TableOfContents.js)
- `onScroll` iterates all TOC items, calling `document.getElementById(id)` and `.getBoundingClientRect()` for each.
- No throttle, debounce, or `requestAnimationFrame` guard.
- For the current case study pages (typically 4–8 headings), impact is low. If content grows, this could degrade scroll performance.

## Proposed Solutions

### Option A — Add `requestAnimationFrame` throttle (Recommended)
```js
let rafId = null
function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    // ... existing logic
  })
}
```
Clean up `cancelAnimationFrame(rafId)` in the return.

**Pros:** Aligns scroll reads with the paint cycle. Zero overhead on fast scroll.
**Cons:** Trivial added complexity.
**Effort:** Small | **Risk:** None

### Option B — Use IntersectionObserver instead
Replace the scroll listener with an `IntersectionObserver` on each heading. Set active ID when a heading enters a threshold zone.

**Pros:** Most performant approach. No manual scroll math.
**Cons:** More refactoring. IntersectionObserver threshold tuning can be tricky.
**Effort:** Medium | **Risk:** Low

### Option C — Leave as-is
Current performance is acceptable for portfolio-scale content.

**Effort:** None | **Risk:** None

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected file:** `src/components/TableOfContents.js`
- `useEffect` with `window.addEventListener('scroll', onScroll, { passive: true })`

## Acceptance Criteria

- [ ] Scroll handler does not call `getBoundingClientRect` more than once per animation frame
- [ ] Active heading still updates correctly during scroll

## Work Log

- **2026-03-29** — Found during whole-project code review.

## Resources

- [TableOfContents.js](../src/components/TableOfContents.js)
