---
status: pending
priority: p3
issue_id: "010"
tags: [code-review, performance]
dependencies: []
---

# Fixed-Size Images Missing sizes Prop

## Problem Statement
Several `<Image>` components render fixed-size icons/avatars with `width` and `height` props but no `sizes` prop. Next.js generates an unnecessarily wide srcset that includes large variants, causing the browser to fetch more data than needed for small UI elements.

## Findings

- **`src/components/CapabilitiesSection.js`** — capability card icons (`width={40} height={40}`) and tool logos (`width={24} height={24}`) missing `sizes`
- **`src/components/TestimonialsSection.js`** — avatar images (`width={44} height={44}`) missing `sizes`

## Proposed Solutions

### Option A: Add sizes prop matching the rendered size
```jsx
<Image width={40} height={40} sizes="40px" ... />
<Image width={24} height={24} sizes="24px" ... />
<Image width={44} height={44} sizes="44px" ... />
```
**Effort:** Small
**Risk:** Low

### Option B: Use unoptimized prop for purely decorative icons
For simple brand logos and icons, `unoptimized` skips srcset generation entirely and serves the source directly.
**Cons:** Loses WebP conversion benefit
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — simple and correct.

## Technical Details
- **Affected files:** `src/components/CapabilitiesSection.js`, `src/components/TestimonialsSection.js`

## Acceptance Criteria
- [ ] All fixed-size `<Image>` components have a `sizes` prop matching their rendered pixel size
- [ ] No regressions in visual appearance

## Work Log
- 2026-03-31: Identified during performance review
