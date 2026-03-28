---
status: complete
priority: p3
issue_id: "003"
tags: [code-review, quality]
dependencies: []
---

# scroll-mt-10 May Not Clear the Floating Nav

## Problem Statement

All headings targeted by the TOC use `scroll-mt-10` (= 40px). If `FloatingNav` renders taller than 40px at any viewport size, clicking a TOC link will snap the heading behind the nav bar, partially obscuring it.

The original aside was `sticky top-24` (96px), suggesting the nav height was assumed to be ~96px. The `scroll-mt-10` value is much smaller.

## Findings

- **Location:** [src/app/craft/[slug]/page.js:94,98,102,284](src/app/craft/%5Bslug%5D/page.js#L94) — `scroll-mt-10` on all three heading levels and contextSection h2s
- The previous commit did not include any scroll-margin values; these are new additions
- `FloatingNav` height is unknown without inspecting that component — needs cross-check

## Proposed Solutions

### Option A — Match scroll-mt to FloatingNav height
Inspect `FloatingNav` and set `scroll-mt` to the actual rendered height + a small buffer (e.g. `scroll-mt-24` = 96px to match the previous `top-24`).

**Pros:** Precise; headings always visible after scroll
**Cons:** Must be updated if FloatingNav height changes
**Effort:** Small  **Risk:** Low

### Option B — Use a CSS variable / design token
Define `--nav-height` and use it in both FloatingNav and `scroll-mt` via a `[scroll-margin-top:var(--nav-height)]` utility.

**Pros:** Single source of truth; auto-correct when nav height changes
**Cons:** Slightly more setup
**Effort:** Small  **Risk:** Low

### Option C — Leave as-is and verify visually
If FloatingNav is shorter than 40px or not visible on the pages where the TOC appears (desktop-only pages), no fix needed.

**Pros:** No code change needed if it's fine
**Cons:** Relies on manual verification
**Effort:** Minimal  **Risk:** Low

## Recommended Action

_Pending triage — verify FloatingNav height on desktop_

## Technical Details

- **Affected files:** `src/app/craft/[slug]/page.js`
- `scroll-mt-10` = `2.5rem` = `40px`
- `top-24` = `6rem` = `96px`

## Acceptance Criteria

- [ ] Clicking any TOC link reveals the full heading below the floating nav
- [ ] Verified at lg and xl breakpoints

## Work Log

- 2026-03-28: Identified during code review of commit 0027975
