---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, performance, mobile, accessibility]
dependencies: []
---

# 002 · Booking modal scroll lock unreliable on iOS Safari

## Problem Statement

`BookingButton.js` locks body scroll when the booking modal opens with `document.body.style.overflow = 'hidden'`. On iOS Safari, this technique does **not** prevent the page underneath from scrolling. Users on iPhones can scroll the background while the modal is open, which is disorienting and looks broken.

## Findings

- **Location:** [src/components/BookingButton.js](../src/components/BookingButton.js) — `handleOpen` sets `document.body.style.overflow = 'hidden'`; `handleClose` restores `''`.
- iOS Safari ignores `overflow: hidden` on `<body>` — the viewport still scrolls.
- The cleanup `useEffect` (on unmount) does restore the value as a safety net, which prevents permanent lockout, but the underlying lock doesn't work on iOS.

## Proposed Solutions

### Option A — `position: fixed` approach (Recommended)
Save `window.scrollY` before opening, set `body { position: fixed; top: -${scrollY}px; width: 100%; }`, restore on close by setting `scrollTo(0, savedY)`.

```js
const handleOpen = () => {
  const scrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
  document.body.dataset.scrollY = scrollY
  // ...
}
const handleClose = () => {
  const scrollY = parseInt(document.body.dataset.scrollY ?? '0', 10)
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  window.scrollTo(0, scrollY)
  // ...
}
```

**Pros:** Works on iOS Safari. Battle-tested pattern.
**Cons:** Causes a tiny scroll jump on close (imperceptible at correct position).
**Effort:** Small | **Risk:** Low

### Option B — CSS `overscroll-behavior` on modal
Wrap the modal in a container with `overscroll-behavior: contain`. Combined with `overflow: hidden` on body, this is effective on modern browsers but still not on iOS.

**Pros:** Clean CSS-only approach.
**Cons:** Still broken on iOS Safari without Option A's position trick.
**Effort:** Small | **Risk:** Low (but incomplete fix)

### Option C — Use a library (e.g. `body-scroll-lock`)
Import a dedicated scroll-lock package that handles all edge cases.

**Pros:** Handles all browsers, touch events, nested scrollable containers.
**Cons:** Extra dependency for a single modal.
**Effort:** Small | **Risk:** Low

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected file:** `src/components/BookingButton.js`
- `handleOpen` / `handleClose` — the scroll lock/unlock logic
- Also affects the `useEffect` cleanup (safety net restore)

## Acceptance Criteria

- [ ] Opening the booking modal on an iPhone prevents the background from scrolling
- [ ] Closing the modal restores scroll position correctly
- [ ] No layout shift visible when modal opens/closes

## Work Log

- **2026-03-29** — Found during whole-project code review. Tested pattern is well-known iOS limitation.

## Resources

- [BookingButton.js](../src/components/BookingButton.js)
- [MDN — Preventing scroll on iOS](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)
