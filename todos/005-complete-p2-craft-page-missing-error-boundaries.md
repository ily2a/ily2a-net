---
status: complete
priority: p2
issue_id: "005"
tags: [code-review, architecture, quality]
dependencies: []
---

# craft/page.js Missing SilentErrorBoundary Wrappers

## Problem Statement

On `/craft/page.js`, both `FloatingNav` and `ContactSection` are rendered without a `SilentErrorBoundary`. On the home page and the case study page, these same components are wrapped — so if either crashes on `/craft`, it takes down the entire page instead of silently degrading. This is an inconsistency that creates a reliability gap.

## Findings

- **Location:** [src/app/craft/page.js:41-44](src/app/craft/page.js#L41-L44)
  ```jsx
  <FloatingNav />
  <CraftSection projects={projects} headingAs="h1" navOffset />
  <ContactSection />
  ```
- **Contrast — home page:** `page.js:28` wraps `FloatingNav` in `SilentErrorBoundary`; `page.js:37` wraps `ContactSection`
- **Contrast — case study:** `craft/[slug]/page.js:239` and `:343` both use `SilentErrorBoundary`

## Proposed Solutions

### Option A — Add SilentErrorBoundary (Recommended)
Wrap `FloatingNav` and `ContactSection` identically to how the home page does it.

**Pros:** Matches existing pattern; zero behaviour change under normal conditions
**Cons:** None
**Effort:** XSmall  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected file:** `src/app/craft/page.js`
- **Pattern to match:** `src/app/page.js` lines 28, 37

## Acceptance Criteria

- [ ] `FloatingNav` on `/craft` is wrapped in `SilentErrorBoundary`
- [ ] `ContactSection` on `/craft` is wrapped in `SilentErrorBoundary`
- [ ] Consistent wrapping pattern across all pages that use these components

## Work Log

- 2026-03-28: Identified during full project code review
