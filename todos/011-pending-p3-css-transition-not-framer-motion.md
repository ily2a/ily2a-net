---
status: pending
priority: p3
issue_id: "011"
tags: [code-review, code-standards]
dependencies: []
---

# gradient-button Uses CSS transition Instead of Framer Motion

## Problem Statement
The `.gradient-button` class in `globals.css` uses a raw CSS `transition: background-position 0.5s ease` for its hover animation, bypassing Framer Motion. Per project code standards, all interactive animations should use Framer Motion. This creates an inconsistent pattern alongside the `whileTap` Framer Motion already on `ContactFormButton`.

## Findings

- **`src/app/globals.css`** — `.gradient-button` class has `transition: background-position 0.5s ease` and a `:hover` pseudo-class for the background animation
- **`src/components/ContactFormButton.js`** — uses `whileTap` via Framer Motion but relies on CSS for the hover gradient

## Proposed Solutions

### Option A: Convert to Framer Motion whileHover
Replace the CSS transition with `whileHover` on the button element, animating the gradient position as an inline style.
**Pros:** Consistent with code standards
**Cons:** Slightly more complex than a CSS transition for a background-position animation
**Effort:** Small
**Risk:** Low

### Option B: Accept the CSS transition as-is
The CSS `background-position` trick is a common and performant pattern that Framer Motion doesn't natively support for gradient position. Document the exception.
**Pros:** No change needed
**Cons:** Inconsistency with code standards
**Effort:** None

## Recommended Action
Option B may be pragmatic here — `background-position` animation is not naturally expressible via Framer Motion's `animate` API without JavaScript frame-by-frame updates, and the CSS approach is GPU-composited. If this is acceptable, add a comment explaining the exception.

## Technical Details
- **Affected files:** `src/app/globals.css`, `src/components/ContactFormButton.js`

## Acceptance Criteria
- [ ] Either: CSS transition replaced with Framer Motion `whileHover`
- [ ] Or: Code comment documents the intentional exception to the Framer Motion rule

## Work Log
- 2026-03-31: Identified during code quality review
