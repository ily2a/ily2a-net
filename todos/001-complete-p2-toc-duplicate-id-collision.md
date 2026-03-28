---
status: pending
priority: p2
issue_id: "001"
tags: [code-review, quality, architecture]
dependencies: []
---

# TOC Duplicate ID Collision Risk

## Problem Statement

`toId()` generates anchor IDs from heading text with no deduplication. If a `contextSection` label and a `data.body` heading share the same text (e.g. the section label "Problem" and a body `h2` "Problem"), both elements get `id="problem"`. The browser silently ignores the second — the TOC link for the second heading scrolls to the wrong element, and the IntersectionObserver never fires for it.

This is a realistic concern because `contextSection` labels (`Business Need`, `Problem`, `Goals`, `Project Strategy`) are generic terms an author could naturally also use as body headings.

## Findings

- **Location:** [src/app/craft/[slug]/page.js:16-17](src/app/craft/%5Bslug%5D/page.js#L16-L17) — `toId()` with no dedup logic
- **TOC build:** lines 199-203 — no dedup across the three sources (contextSections, bodyHeadings, prototype)
- **Component:** [src/components/TableOfContents.js:14](src/components/TableOfContents.js#L14) — `document.getElementById(id)` returns only the first match
- **Evidence:** HTML spec says the first element with a given id wins for fragment navigation; duplicate ids are invalid HTML

## Proposed Solutions

### Option A — Suffix-based deduplication (Recommended)
Build the `tocItems` array with a seen-id tracker; append `-2`, `-3` to duplicates. Apply the same suffix logic when rendering the heading elements in `ptBody` and the contextSection `<h2>` elements.

**Pros:** Correct behaviour; no reliance on author discipline
**Cons:** Requires syncing the suffix logic across two places (page-level ID generation for DOM elements AND tocItems)
**Effort:** Small  **Risk:** Low

### Option B — Namespace by source
Prefix IDs by source, e.g. `section-problem`, `body-problem`. Update `tocItems` and `id=` attributes accordingly.

**Pros:** IDs are always unique by construction
**Cons:** Uglier URLs; breaks if the same body heading appears twice
**Effort:** Small  **Risk:** Low

### Option C — Author discipline (do nothing)
Document that authors must not reuse heading text that matches section labels.

**Pros:** Zero code change
**Cons:** Silent breakage; hard to enforce in a CMS
**Effort:** None  **Risk:** High

## Recommended Action

_Pending triage_

## Technical Details

- **Affected files:** `src/app/craft/[slug]/page.js`, `src/components/TableOfContents.js`
- **Components:** `CaseStudyPage`, `TableOfContents`, `toId`

## Acceptance Criteria

- [ ] No two elements in the rendered page share the same `id`
- [ ] TOC links scroll to the correct heading when duplicates exist
- [ ] IntersectionObserver observes the correct element for each TOC item

## Work Log

- 2026-03-28: Identified during code review of commit 0027975
