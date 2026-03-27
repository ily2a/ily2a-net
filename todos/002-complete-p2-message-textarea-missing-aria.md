---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, accessibility, quality]
dependencies: []
---

# Message textarea missing aria-invalid and aria-describedby

## Problem Statement

The contact form's `name` and `email` fields correctly use `aria-invalid` and `aria-describedby` to associate their error messages with screen readers. The `message` textarea does not — its error `<p>` has no `id`, and the textarea has no `aria-invalid` or `aria-describedby`. Screen reader users submitting the form without a message won't receive the error feedback.

## Findings

- **Name field** (`src/components/ContactSection.js:103-108`): has `aria-invalid={errors.name || undefined}` and `aria-describedby={errors.name ? 'name-error' : undefined}`; error `<p>` has `id="name-error"` ✓
- **Email field** (`src/components/ContactSection.js:126-131`): same pattern ✓
- **Message textarea** (`src/components/ContactSection.js:143-158`): no `aria-invalid`, no `aria-describedby`; error `<p>` has no `id` ✗

## Proposed Solutions

### Option A — Mirror the name/email pattern (Recommended)
Add `aria-invalid`, `aria-describedby` to the textarea and `id="message-error"` to the error `<p>`.

```jsx
<motion.textarea
  ...
  aria-invalid={errors.message || undefined}
  aria-describedby={errors.message ? 'message-error' : undefined}
/>
{errors.message && (
  <p id="message-error" className="text-[12px] text-error">
    Please tell me how I can help.
  </p>
)}
```

- **Pros**: Consistent with the rest of the form, proper ARIA semantics
- **Effort**: Small (2-minute fix)
- **Risk**: None

## Recommended Action

Option A — trivial fix, high accessibility value.

## Technical Details

- **Affected file**: `src/components/ContactSection.js:143-158`

## Acceptance Criteria

- [ ] `motion.textarea` has `aria-invalid={errors.message || undefined}`
- [ ] `motion.textarea` has `aria-describedby={errors.message ? 'message-error' : undefined}`
- [ ] Error `<p>` has `id="message-error"`
- [ ] Screen reader announces error when message field is empty on submit

## Work Log

- 2026-03-27: Found during full project code review — accessibility inconsistency vs other fields.
