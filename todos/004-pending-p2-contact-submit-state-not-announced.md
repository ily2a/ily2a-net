---
status: pending
priority: p2
issue_id: "004"
tags: [code-review, accessibility]
dependencies: []
---

# Contact Form Submit Button State Not Announced to Screen Readers

## Problem Statement
The contact form submit button changes text between "Submit", "Sending…", and "Sent ✓" but these changes are not announced to screen readers. The `aria-live` region for error/success messages is correct, but button text changes are outside it and go unannounced. Screen reader users won't know the form is submitting until they navigate to the button.

## Findings

- **`src/components/ContactSection.js` lines ~115–120** — button text changes based on form state but no `aria-live` region announces the state change.
- The error/success message `aria-live="polite"` region exists and works correctly.
- The gap: submitting state (spinner/loading text) is invisible to screen readers.

## Proposed Solutions

### Option A: aria-live on button text container
Wrap the button text in an `aria-live="polite"` span:
```jsx
<button type="submit" ...>
  <span aria-live="polite" aria-atomic="true">
    {isSubmitting ? 'Sending…' : submitted ? 'Sent' : 'Submit'}
  </span>
</button>
```
**Pros:** Simple, surgical change
**Effort:** Small
**Risk:** Low

### Option B: aria-describedby linking button to status region
```jsx
<button type="submit" aria-describedby="form-status" ...>
```
Where `form-status` is the id of the existing status/error live region.

**Pros:** Connects button to the full status message
**Cons:** Description is read on focus, not on state change
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — wrapping the button text in an `aria-live` span is the most direct and reliable solution.

## Technical Details
- **Affected files:** `src/components/ContactSection.js`

## Acceptance Criteria
- [ ] Screen reader announces "Sending…" when form is submitted
- [ ] Screen reader announces "Sent" when submission succeeds
- [ ] Existing error/success message announcements still work

## Work Log
- 2026-03-31: Identified during accessibility review
