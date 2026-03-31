---
name: PasswordGate error message not announced to screen readers
description: The "Incorrect password" error in PasswordGate appears visually but has no aria-live region to announce it
type: p2
status: pending
priority: p2
issue_id: "003"
tags: [code-review, accessibility]
---

## Problem Statement

When an incorrect password is submitted in `PasswordGate.js`, the error message at [PasswordGate.js:118-120](src/components/PasswordGate.js) renders visually, and the input has `aria-invalid` + `aria-describedby` set. However, screen reader users won't automatically hear the error announced when it appears because there's no `aria-live` container around it.

`ContactSection.js` handles this correctly with an `aria-live="polite" aria-atomic="true"` wrapper — `PasswordGate` should follow the same pattern.

## Findings

- [PasswordGate.js:95-96](src/components/PasswordGate.js) — `aria-invalid` and `aria-describedby` set on input (good)
- [PasswordGate.js:118-120](src/components/PasswordGate.js) — error `<p>` rendered conditionally with no live region
- [ContactSection.js:172-198](src/components/ContactSection.js) — correct reference: `aria-live="polite" aria-atomic="true"` wrapper around status messages

## Proposed Solutions

### Option A: Wrap error zone in aria-live (Recommended)
```jsx
<div aria-live="polite" aria-atomic="true">
  {status === 'error' && (
    <p id="cs-password-error" className="text-[12px] text-error">
      Incorrect password. Try again.
    </p>
  )}
</div>
```
Always render the wrapper, conditionally render the message inside it so screen readers detect the change.
**Effort:** Small | **Risk:** Low

### Option B: Move the error above the input
Place the live region before the input in DOM order so it's read before the user encounters the field again.
**Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] Screen readers announce the "Incorrect password" error when it appears
- [ ] `aria-live="polite"` container is always present in DOM, message appears/disappears inside it
- [ ] `aria-invalid` + `aria-describedby` remain intact on the input

## Work Log
- 2026-03-30: Identified during full project code review
