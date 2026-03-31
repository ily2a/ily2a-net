---
name: SpotlightButton button variant missing type="button" attribute
description: When SpotlightButton renders as a <button> (no href), it lacks type="button" and defaults to type="submit" inside forms
type: p3
status: pending
priority: p3
issue_id: "006"
tags: [code-review, quality]
---

## Problem Statement

[SpotlightButton.js:57-69](src/components/SpotlightButton.js) renders a `<motion.button>` when no `href` is provided but does not set `type="button"`. Per the HTML spec, a `<button>` inside a `<form>` defaults to `type="submit"`. If SpotlightButton with an `onClick` is ever placed inside a form (or a parent form element is added around navigation), it would submit the form unexpectedly.

Currently SpotlightButton is only used with `href` in the live codebase, so this is not a current bug — it's a defensive hygiene issue.

## Findings

- [SpotlightButton.js:57-69](src/components/SpotlightButton.js) — `<motion.button>` branch, no `type` attribute

## Proposed Solution

Add `type="button"` to the `<motion.button>`:
```jsx
<motion.button
  type="button"
  ref={ref}
  onClick={onClick}
  ...
>
```
**Effort:** Trivial | **Risk:** None

## Acceptance Criteria
- [ ] `<motion.button>` variant of SpotlightButton has `type="button"`

## Work Log
- 2026-03-30: Identified during full project code review
