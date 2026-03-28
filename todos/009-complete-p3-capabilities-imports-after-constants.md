---
status: complete
priority: p3
issue_id: "009"
tags: [code-review, quality]
dependencies: []
---

# CapabilitiesSection: Import Statements After Constant Declarations

## Problem Statement

`CapabilitiesSection.js` declares the `CARDS` and `SKILL_GROUPS` constants (lines 3–29) before the `import` statements (lines 31–32). JavaScript hoists `import` declarations to the top at runtime so this works, but it's non-standard, confusing, and inconsistent with every other file in the project where imports are always at the top.

## Findings

- **Location:** [src/components/CapabilitiesSection.js:1-32](src/components/CapabilitiesSection.js#L1-L32)
  ```js
  'use client'

  const CARDS = [ ... ]         // line 3 — data BEFORE imports
  const SKILL_GROUPS = [ ... ]  // line 20

  import { useRef, useState, useCallback } from 'react'  // line 31
  import Image from 'next/image'  // line 32
  ```
- All other components in the project follow: `'use client'` → imports → constants → component

## Proposed Solutions

### Option A — Move imports to the top (Recommended)
Reorder so `import` statements appear immediately after `'use client'`, followed by constants, then the component.

**Pros:** Consistent with rest of codebase; standard JS module convention; clearer dependency graph
**Cons:** None
**Effort:** XSmall  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected file:** `src/components/CapabilitiesSection.js`

## Acceptance Criteria

- [ ] All `import` statements appear before any `const` declarations in the file

## Work Log

- 2026-03-28: Identified during full project code review
