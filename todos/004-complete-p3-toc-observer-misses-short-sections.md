---
status: pending
priority: p3
issue_id: "004"
tags: [code-review, quality]
dependencies: []
---

# IntersectionObserver rootMargin May Miss Short Sections

## Problem Statement

The IntersectionObserver uses `rootMargin: '-20% 0px -70% 0px'`, creating an active detection zone covering only the middle 10% of the viewport. For very short sections (headings followed by a few lines of text), the heading element may never enter this narrow band as the user scrolls, leaving the TOC stuck on the previous active item or with no active item at all.

## Findings

- **Location:** [src/components/TableOfContents.js:10-14](src/components/TableOfContents.js#L10-L14)
- The rootMargin means: "only consider an element intersecting if it is between 20% from the top and 30% from the bottom of the viewport"
- For a heading near the bottom of a short section, the section may scroll through the active zone entirely within one scroll tick, skipping the highlight

## Proposed Solutions

### Option A — Widen the detection zone
Change to `rootMargin: '-10% 0px -80% 0px'` or similar to give more room at the top of the viewport.

**Pros:** Simple; catches more cases
**Cons:** May cause the active item to switch too early for long sections
**Effort:** Minimal  **Risk:** Low

### Option B — Track topmost visible heading
Replace the `isIntersecting` approach with a scroll listener that finds the topmost heading currently above the middle of the viewport. More robust across all content lengths.

**Pros:** Correct for all section sizes
**Cons:** More complex; runs on scroll (minor perf)
**Effort:** Medium  **Risk:** Low

### Option C — Accept current behaviour
For a portfolio case study, short sections are uncommon and the UX impact is minimal (TOC simply doesn't highlight briefly).

**Pros:** No change needed
**Cons:** Minor glitchiness for short sections
**Effort:** None  **Risk:** None

## Recommended Action

_Pending triage — low urgency, assess in real content_

## Technical Details

- **Affected files:** `src/components/TableOfContents.js`

## Acceptance Criteria

- [ ] TOC correctly highlights the active section for both short (<3 lines) and long (>20 lines) sections
- [ ] No flickering or stuck-active-state during normal scroll

## Work Log

- 2026-03-28: Identified during code review of commit 0027975
