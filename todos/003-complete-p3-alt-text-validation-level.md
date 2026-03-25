---
status: pending
priority: p3
issue_id: "003"
tags: [code-review, quality, accessibility, seo]
dependencies: []
---

# Alt Text Validation Uses `.warning()` — Editors Can Publish Without Alt Text

## Problem Statement

Both the `coverImage` and body `image` alt text fields use `Rule.required().warning(...)`. In Sanity Studio, `.warning()` sets the validation severity to "warning" (yellow), which does NOT block publishing. Editors will see a yellow indicator but can still publish without filling in alt text.

If the intent was to enforce alt text for accessibility and SEO, `.error()` (or just `.required()` without a severity override) should be used instead.

## Findings

**Location:** `src/sanity/schemaTypes/caseStudy.js`

```js
// coverImage alt (new):
validation: (Rule) => Rule.required().warning('Alt text is required for SEO and accessibility'),

// body image alt (updated):
validation: (Rule) => Rule.required().warning('Alt text is required for SEO and accessibility'),
```

In Sanity's validation API:
- `.error(message)` → blocks publishing (red indicator)
- `.warning(message)` → advisory only (yellow indicator), does NOT block publishing

So `Rule.required().warning(...)` = "show a warning if empty, but don't block". This is likely unintentional given the message says "is required".

The page code handles missing alt text gracefully (`alt={value.alt || value.caption || ''}` for body images, `alt={data.coverImage?.alt || data.title}` for cover), so there's no broken UI — but alt text may silently be empty for screen readers.

## Proposed Solutions

### Option A: Change to `.error()` to block publishing without alt text

```js
validation: (Rule) => Rule.required().error('Alt text is required for accessibility and SEO'),
```

**Pros:** Enforces the stated requirement.
**Cons:** Will show errors on any existing documents without alt text — editors must fill them in before publishing changes.
**Effort:** Small. **Risk:** Low (may require updating existing Sanity documents).

### Option B: Keep warnings but add a note in the title

Keep `.warning()` intentionally (non-blocking) but make the intent clearer:

```js
{
  name: 'alt',
  title: 'Alt text (recommended for SEO)',
  type: 'string',
  validation: (Rule) => Rule.warning('Describe the image for screen readers and SEO'),
}
```

**Pros:** No existing content breaks.
**Cons:** Alt text remains truly optional.
**Effort:** Small. **Risk:** None.

### Option C: Use `required()` without message override (default error level)

```js
validation: Rule => Rule.required(),
```

**Pros:** Clean, blocks publishing.
**Cons:** Generic error message.
**Effort:** Trivial. **Risk:** Same as Option A.

## Recommended Action

_To be filled during triage._

## Technical Details

- **Affected files:** `src/sanity/schemaTypes/caseStudy.js`
- **Affected components:** Sanity Studio content editor
- **Database changes:** None (schema only)

## Acceptance Criteria

- [ ] The validation severity matches the stated intent (warn vs. block)
- [ ] Existing content is not silently missing alt text on live case studies
- [ ] Decision is documented in schema comment

## Work Log

- 2026-03-25: Found during code review.

## Resources

- [Sanity validation docs](https://www.sanity.io/docs/validation)
