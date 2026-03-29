---
status: pending
priority: p3
issue_id: "007"
tags: [code-review, accessibility, quality]
dependencies: []
---

# 007 · `error.js` applies `role="alert"` to an `<h1>` element

## Problem Statement

`error.js` renders `<h1 role="alert">`. The `alert` ARIA role causes screen readers to announce the element immediately and interruptively when the page loads, bypassing normal reading order. Since the error page is the *only* content on screen and the `<h1>` would already be read first by screen readers, adding `role="alert"` causes the error message to be announced **twice** in rapid succession — once via the alert role, once in normal reading flow.

This doesn't break functionality but is non-standard and mildly disruptive for screen reader users.

## Findings

- **Location:** [src/app/error.js:11](../src/app/error.js):
  ```jsx
  <h1 role="alert" className="font-light ...">
    Something broke on our end.<br />
    Try refreshing or head back home.
  </h1>
  ```
- `role="alert"` is designed for dynamically injected content (e.g. form error messages added to the DOM after interaction). Using it on a static `<h1>` that is always present in the initial render is unconventional.

## Proposed Solutions

### Option A — Remove `role="alert"` from the h1 (Recommended)
The `<h1>` communicates the error clearly without the alert role. Screen readers will announce it naturally.

```jsx
<h1 className="font-light ...">
  Something broke on our end.
  ...
</h1>
```

**Pros:** Standard, correct HTML. No double-announcement.
**Cons:** None.
**Effort:** Trivial | **Risk:** None

### Option B — Use a visually hidden `<div role="status">` alongside the h1
If live announcement is desired, add a `role="status"` or `role="alert"` to a separate hidden element:

```jsx
<div role="alert" className="sr-only">Page error. Something broke.</div>
<h1>Something broke on our end.</h1>
```

**Pros:** Live region works as intended without double-announcing the full heading.
**Cons:** Slight code duplication.
**Effort:** Trivial | **Risk:** None

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected file:** `src/app/error.js`

## Acceptance Criteria

- [ ] The error page `<h1>` does not carry `role="alert"`
- [ ] Screen readers announce the error page content correctly without interruption

## Work Log

- **2026-03-29** — Found during whole-project code review.

## Resources

- [src/app/error.js](../src/app/error.js)
- [MDN ARIA alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/alert_role)
