---
status: complete
priority: p2
issue_id: "006"
tags: [code-review, performance, architecture]
dependencies: []
---

# CraftSection Dual DOM Rendering Doubles Image Requests

## Problem Statement

`CraftSection` renders both `ProjectCard` (desktop) and `ProjectCardMobile` (mobile) for every project, with one hidden via CSS at each breakpoint. Both are always in the DOM, which means the browser fetches images for both cards on every viewport — effectively doubling image network requests. On the home page with 4 projects, this is 8 card images loaded instead of 4. On `/craft` (all projects), the impact scales linearly.

`ProjectCard` also conditionally renders a hover image (`cardImageHover`) which is loaded eagerly. On mobile this hover image is never visible but still requested.

## Findings

- **Location:** [src/components/CraftSection.js:37-43](src/components/CraftSection.js#L37-L43)
  ```jsx
  {projects.map((project) => (
    <div key={project._id}>
      <div className="tab:hidden"><ProjectCardMobile project={project} /></div>
      <div className="hidden tab:block"><ProjectCard project={project} /></div>
    </div>
  ))}
  ```
- **Image loading:** `ProjectCard` uses `fill` with no `loading="lazy"` on the default image (line 65), so all desktop card images load immediately even when hidden behind CSS
- **Hover image:** `ProjectCard` line 79 has `loading="lazy"` on the hover image but it still gets a network request once the main image renders

## Proposed Solutions

### Option A — Single component with responsive rendering (Recommended)
Merge `ProjectCard` and `ProjectCardMobile` into a single component that adapts layout internally using CSS, or use a shared image source with responsive `sizes`. Eliminates duplicate DOM nodes and halves image requests.

**Pros:** Correct and efficient; one component to maintain
**Cons:** Requires refactoring both card components
**Effort:** Medium  **Risk:** Low

### Option B — JS-driven conditional rendering
Use `useWindowWidth` (already in the project) to conditionally render only the appropriate card variant.

**Pros:** Simple, no component refactor needed
**Cons:** Introduces a hydration flash (server renders one, client switches after mount); `useWindowWidth` returns 0 until mounted, briefly showing the wrong card
**Effort:** Small  **Risk:** Low-Medium (hydration behaviour)

### Option C — CSS-only with Next.js Image `sizes`
Keep both cards but add `sizes` attributes that hint `0px` for the hidden variant, letting the browser skip fetching it.

**Pros:** No structural change
**Cons:** Browsers may still fetch both; spec doesn't guarantee skipping hidden images
**Effort:** XSmall  **Risk:** Medium (not reliable across browsers)

## Recommended Action

_Pending triage_

## Technical Details

- **Affected files:** `src/components/CraftSection.js`, `src/components/ProjectCard.js`, `src/components/ProjectCardMobile.js`
- **Scope:** Home page (4 projects × 2 cards = 8 nodes) and `/craft` page (N projects × 2 cards)

## Acceptance Criteria

- [ ] Each project renders exactly one card in the DOM at any given viewport
- [ ] No image requests are made for the hidden card variant
- [ ] Visual behaviour is unchanged across mobile and desktop breakpoints

## Work Log

- 2026-03-28: Identified during full project code review
