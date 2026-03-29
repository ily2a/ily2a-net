---
status: pending
priority: p3
issue_id: "006"
tags: [code-review, quality, ux, accessibility]
dependencies: []
---

# 006 · Portable Text link renderer silently falls back to `#` for invalid hrefs

## Problem Statement

In the case study Portable Text renderer, the `link` mark validates that the href uses an allowed protocol (`https?`, `mailto`, or `tel`). If the href is absent or uses an unexpected protocol, it silently falls back to `href="#"`. This means broken or misconfigured links in Sanity content render as clickable text that navigates nowhere (scrolls to top of page), with no visual indicator to distinguish them from valid links.

## Findings

- **Location:** [src/app/craft/[slug]/page.js](../src/app/craft/%5Bslug%5D/page.js) — `ptBody.marks.link` renderer:
  ```js
  const href = /^(https?|mailto|tel):/.test(value?.href ?? '') ? value.href : '#'
  ```
- `href="#"` is rendered with the same styling as valid links (`text-brand underline`), giving no feedback to the content editor that the link is broken.
- In production this would only affect links manually entered in Sanity Studio.

## Proposed Solutions

### Option A — Render broken links as non-interactive `<span>` (Recommended)
```js
if (!href || href === '#') {
  return <span className="text-brand">{children}</span>
}
return <a href={href} ...>{children}</a>
```

**Pros:** Visually identical to the broken-link inline look. Doesn't confuse readers.
**Cons:** None.
**Effort:** Trivial | **Risk:** None

### Option B — Omit the anchor entirely, render children only
```js
const href = /^(https?|mailto|tel):/.test(value?.href ?? '') ? value.href : null
if (!href) return <>{children}</>
return <a href={href} ...>{children}</a>
```

**Pros:** Cleanest output — no dangling markup.
**Cons:** Content editors see no difference between intentionally unlinked and broken link text.
**Effort:** Trivial | **Risk:** None

### Option C — Leave as-is
The `#` fallback is defensive and avoids crashes. Impact is low.

**Effort:** None | **Risk:** None

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected file:** `src/app/craft/[slug]/page.js` — `ptBody.marks.link`

## Acceptance Criteria

- [ ] An invalid or missing href in Sanity content does not render as a clickable `href="#"` link
- [ ] Valid links (https, mailto, tel) continue to render correctly

## Work Log

- **2026-03-29** — Found during whole-project code review.

## Resources

- [src/app/craft/[slug]/page.js](../src/app/craft/%5Bslug%5D/page.js)
