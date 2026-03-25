---
status: pending
priority: p2
issue_id: "001"
tags: [code-review, security, seo]
dependencies: []
---

# JSON-LD XSS: Unescaped `JSON.stringify` in `dangerouslySetInnerHTML`

## Problem Statement

`JSON.stringify` does not HTML-encode `<`, `>`, or `&`. When its output is placed directly inside a `<script>` tag via `dangerouslySetInnerHTML`, any CMS field containing `</script>` will cause the browser's HTML parser to close the script tag early — allowing injected markup after it.

If a Sanity field (title, description, client name) ever contains `</script><script>alert(1)</script>`, the page would execute that script.

For a personal portfolio this is low probability (you control the CMS), but it's a known bad practice and a potential supply-chain risk if a third-party ever writes to Sanity.

## Findings

**Location:** [src/app/craft/[slug]/page.js:206](src/app/craft/[slug]/page.js#L206)

```js
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

`JSON.stringify({ name: 'Foo </script><script>alert(1)</script>' })` produces:
```
{"name": "Foo </script><script>alert(1)</script>"}
```

The HTML parser sees `</script>` at position 14 and closes the script block there.

## Proposed Solutions

### Option A: Unicode-escape angle brackets inline (Recommended — Small effort)
```js
const safeJsonLd = JSON.stringify(jsonLd)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
```
**Pros:** Zero dependencies, idiomatic, valid JSON (unicode escapes are transparent to JSON parsers).
**Cons:** Slightly more verbose.
**Effort:** Small. **Risk:** None.

### Option B: Extract to a utility function (Medium effort)
Create `src/lib/json-ld.js`:
```js
export function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
```
**Pros:** Reusable if you add more JSON-LD to other pages.
**Cons:** Slight over-engineering for one callsite now.
**Effort:** Small. **Risk:** None.

### Option C: Use `serialize-javascript` package (Large effort)
Third-party library that handles all edge cases.
**Pros:** Comprehensive.
**Cons:** Adds a dependency for a one-liner fix. Overkill.
**Effort:** Medium. **Risk:** Dependency management.

## Recommended Action

_To be filled during triage._

## Technical Details

- **Affected files:** `src/app/craft/[slug]/page.js`
- **Affected components:** `CaseStudyPage`, `generateMetadata`
- **Database changes:** None

## Acceptance Criteria

- [ ] The JSON-LD `<script>` tag output HTML-encodes `<`, `>`, `&` via unicode escapes
- [ ] JSON is still valid (parseable by `JSON.parse`)
- [ ] Rich Results Test in Google Search Console continues to pass

## Work Log

- 2026-03-25: Found during code review of SEO/BackToTop changes batch.

## Resources

- [Google: JSON-LD safe embedding](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [OWASP: XSS via JSON in script tags](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
