---
status: pending
priority: p3
issue_id: "005"
tags: [code-review, performance, quality]
dependencies: []
---

# Both ProjectCard and ProjectCardMobile always rendered in DOM

## Problem Statement

`CraftSection.js` renders both `ProjectCard` (desktop) and `ProjectCardMobile` for every project entry, using Tailwind's `hidden` class to toggle visibility:

```jsx
<div className="tab:hidden"><ProjectCardMobile project={project} /></div>
<div className="hidden tab:block"><ProjectCard project={project} /></div>
```

Both components render `<Image>` elements with Sanity-sourced images. This means:
- Twice the DOM nodes per project
- Potentially twice the image requests (depending on browser/lazy loading behaviour)
- Both component trees mount on every viewport size

On the home page with 4 projects and 2 images per card (default + hover), this is up to 16 `<Image>` components in the DOM when 8 are always hidden.

## Findings

- `src/components/CraftSection.js:38-43` — dual rendering pattern
- `src/components/ProjectCard.js:60-86` — renders 2 `<Image>` nodes (default + hover)
- `src/components/ProjectCardMobile.js` — renders its own images
- `src/hooks/useWindowWidth.js` — singleton hook already available in the codebase

## Proposed Solutions

### Option A — Accept current approach (no change)
The CSS-only approach avoids JS-driven layout shifts and React hydration mismatches between server and client. Next.js `<Image>` uses `loading="lazy"` by default, so hidden images may not load immediately. This is a common and accepted pattern.

- **Pros**: No hydration mismatch, no flash of wrong layout
- **Cons**: Double DOM nodes, potential wasted image requests
- **Effort**: None
- **Risk**: None

### Option B — Conditionally render using useWindowWidth
Use the existing `useWindowWidth` hook to render only one card variant. Hide with CSS until hydration to avoid layout shift.

```jsx
const width = useWindowWidth() // returns 0 on server
const isMobile = width > 0 && width <= BREAKPOINTS.MOBILE
// render only isMobile ? <ProjectCardMobile> : <ProjectCard>
```

- **Pros**: Half the DOM nodes, no wasted image loads
- **Cons**: Brief flash between SSR render (width=0 → desktop default) and client hydration
- **Effort**: Small
- **Risk**: Low (layout shift risk on slow connections)

## Recommended Action

Option A is acceptable for a portfolio site at this scale (4-8 projects). Option B if you ever add many more projects or measure LCP impact.

## Technical Details

- **Affected file**: `src/components/CraftSection.js:38-43`

## Acceptance Criteria

- [ ] Decision documented — either accepted as-is or converted to conditional rendering
- [ ] If Option B: no visible layout shift on page load

## Work Log

- 2026-03-27: Found during full project code review.
