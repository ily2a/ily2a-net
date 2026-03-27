---
status: pending
priority: p3
issue_id: "004"
tags: [code-review, security, quality]
dependencies: []
---

# GlassSurface: string props interpolated into SVG data URI without sanitization

## Problem Statement

`GlassSurface.js` interpolates several props directly into an SVG string that becomes a `data:image/svg+xml` URI. The code comment at line 70-73 even flags this:

> "All props interpolated into the SVG data URI must remain numeric. If this component is ever extended, validate props at the call site to prevent SVG injection via string values."

Currently the `mixBlendMode` prop (a string, defaulting to `'difference'`) is interpolated at line 93:
```js
style="mix-blend-mode: ${mixBlendMode}"
```

`mixBlendMode` is a CSS property value — if a caller passed a malicious string like `difference"><script>`, it would be embedded in the SVG. As a `data:` URI this can't execute scripts, but malformed SVG content could break the displacement map or expose an injection vector if the SVG is ever used differently.

The `filterId`, `redGradId`, `blueGradId` IDs come from `useId()` and are safe. But any future contributor adding a new string prop faces the same risk.

## Findings

- `src/components/GlassSurface.js:70-73` — existing comment about the risk
- `src/components/GlassSurface.js:93` — `mixBlendMode` interpolated as CSS string in SVG
- `src/components/GlassSurface.js:80-98` — SVG template literal with numeric props (safe) and one string prop (risk)

Current callers only pass hardcoded `mixBlendMode` values (`'difference'`, `'lighten'`) so there's no active exploit path. The risk is future-proofing.

## Proposed Solutions

### Option A — Add a CSS property allowlist for mixBlendMode (Recommended)
```js
const VALID_BLEND_MODES = new Set([
  'normal','multiply','screen','overlay','darken','lighten',
  'color-dodge','color-burn','hard-light','soft-light',
  'difference','exclusion','hue','saturation','color','luminosity'
])
const safeBlendMode = VALID_BLEND_MODES.has(mixBlendMode) ? mixBlendMode : 'normal'
```

- **Pros**: Closes the injection vector, explicit contract
- **Effort**: Small
- **Risk**: None

### Option B — Encode the string value
Use `encodeURIComponent` on `mixBlendMode` before interpolation — already applied to the whole SVG anyway, so the main benefit is documentation.

- **Pros**: Quick
- **Cons**: Doesn't validate the value is a valid CSS property
- **Effort**: Trivial

## Recommended Action

Option A — cheap defense-in-depth that makes the existing comment unnecessary.

## Technical Details

- **Affected file**: `src/components/GlassSurface.js:70-99`

## Acceptance Criteria

- [ ] `mixBlendMode` is validated against a CSS blend mode allowlist before being interpolated into SVG
- [ ] Invalid values fall back to `'normal'` (or throw in dev)
- [ ] The warning comment is updated or removed

## Work Log

- 2026-03-27: Found during full project code review — existing code comment already identified this risk.
