---
status: complete
priority: p2
issue_id: "006"
tags: [code-review, quality, architecture]
dependencies: []
---

# ErrorBoundary `resetKey` is never applied — retry does not remount children

## Problem Statement

`ErrorBoundary` stores a `resetKey` in state and increments it on retry, with a code comment claiming it "forces a real remount of children on retry". However, the key is never passed to any React element — the render method just returns `<>{this.props.children}</>`. The `resetKey` is dead weight: clicking "Try again" clears `hasError` but does **not** remount children.

If the crash was caused by corrupted component state inside the children tree (the most common case), the children will hit the same error immediately after the reset and loop back to the error UI.

## Findings

- **File**: `src/components/ErrorBoundary.js:13` — `resetKey: 0` initialised but never used in `render()`
- **File**: `src/components/ErrorBoundary.js:31` — `resetKey` is incremented on retry via `setState`
- **File**: `src/components/ErrorBoundary.js:41` — render returns `<>{this.props.children}</>` — no `key` applied

## Proposed Solutions

### Option A — Apply resetKey as a key on the children fragment (Recommended)

Change the non-error render branch to:

```jsx
return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>
```

This forces React to unmount and remount the entire subtree on retry, clearing all descendant state.

- **Pros**: Fixes the bug as intended; matches the existing comment; no API change
- **Cons**: None — this is the standard pattern
- **Effort**: Small (one-line change)
- **Risk**: None

### Option B — Remove resetKey entirely

Remove `resetKey` from state and the increment call, accepting that retry re-renders without remounting. For most recoverable errors this is fine, but for state-corruption crashes it won't recover.

- **Pros**: Simpler state
- **Cons**: Doesn't fix the root cause — children may immediately re-crash
- **Effort**: Small
- **Risk**: Low, but leaves the retry potentially ineffective

## Recommended Action

Option A — one-line fix, matches the documented intent.

## Technical Details

- **Affected file**: `src/components/ErrorBoundary.js`
- **Pattern**: `<React.Fragment key={this.state.resetKey}>` forces a clean unmount/remount of the subtree
- **No database changes**

## Acceptance Criteria

- [ ] `key={this.state.resetKey}` is applied to the children wrapper in the non-error render branch
- [ ] Clicking "Try again" causes a full remount of children (verifiable by checking React DevTools)
- [ ] The existing `resetKey` comment is accurate

## Work Log

- 2026-03-28: Found during full project code review — resetKey incremented but never applied to React tree.

## Resources

- Component: `src/components/ErrorBoundary.js`
- React error boundary docs: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
