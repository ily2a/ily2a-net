---
status: complete
priority: p3
issue_id: "007"
tags: [code-review, quality]
dependencies: []
---

# Contact form permanently disables send button after success

## Problem Statement

After a successful form submission, the submit button is permanently disabled (`status === 'sent'`) and there is no way to send another message without refreshing the page. The "Retry" button only appears on error, not on success. A visitor who wants to send a follow-up or who accidentally submitted too early has no recourse.

## Findings

- **File**: `src/components/ContactSection.js:165` — `disabled={status === 'sending' || status === 'sent'}` disables the button permanently after success
- **File**: `src/components/ContactSection.js:167` — Button label changes to "Sent ✓" but there is no "Send another" or reset mechanism
- No `aria-live` announcement for success state (the live region at line 171 only triggers on `status === 'error'`)

## Proposed Solutions

### Option A — Add a "Send another message" button after success (Recommended)

When `status === 'sent'`, show a secondary reset button that calls `setStatus('idle')`:

```jsx
{status === 'sent' && (
  <button type="button" onClick={() => setStatus('idle')}>
    Send another message
  </button>
)}
```

- **Pros**: Clear UX; expected behaviour for contact forms
- **Cons**: None
- **Effort**: Small
- **Risk**: None

### Option B — Auto-reset after a delay

Reset `status` to `'idle'` via `setTimeout` ~5 seconds after success, preserving form fields cleared state.

- **Pros**: No extra button needed
- **Cons**: Surprising if user is still reading the confirmation
- **Effort**: Small
- **Risk**: Low

### Option C — Accept current behaviour

Keep the one-message-per-session design intentionally. Add a comment noting this is deliberate.

- **Pros**: Simplest
- **Cons**: Poor UX for legitimate follow-ups
- **Effort**: Minimal
- **Risk**: None

## Recommended Action

Option A. Also add success state to the `aria-live` region so screen readers announce it:

```jsx
{status === 'sent' && <p>Your message was sent successfully.</p>}
```

## Technical Details

- **Affected file**: `src/components/ContactSection.js`
- **No database changes**

## Acceptance Criteria

- [ ] After a successful submission, the visitor can initiate a new message without refreshing
- [ ] Success state is announced via the `aria-live` region

## Work Log

- 2026-03-28: Found during full project code review.

## Resources

- Component: `src/components/ContactSection.js`
