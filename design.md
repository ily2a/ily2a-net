# Design System — ily2a.net

The design language for Ily Ameur's portfolio. A dark, glass-and-amethyst
aesthetic with weighted spring motion. Every rule here is enforced in code via
Tailwind v4 `@theme` tokens (`src/app/globals.css`), shared Framer Motion configs
(`src/constants/animations.ts`), and hex mirrors for non-CSS contexts
(`src/constants/colors.ts`).

## Non-Negotiable Standards

These three are hard rules. Audit every UI change against them before shipping:

1. **Framer Motion for all animation.** Use `m.*` elements, variants, and the
   `animate()` utility. No raw CSS transitions for interactive states. The one
   sanctioned exception is `.gradient-button`'s `background-position` sweep across
   a multi-stop gradient — a case pure CSS expresses cleaner than a JS driver.
2. **Design tokens for all color.** Reference `var(--color-*)` or the Tailwind
   token classes (`text-brand`, `bg-surface`, `text-error`, …). No hardcoded hex
   in component code. The only hex lives in `colors.ts`, and only for contexts CSS
   variables can't reach (WebGL shader uniforms, build-time metadata strings).
3. **Tailwind for all styling.** Inline `style` only when Tailwind can't express
   it — dynamic CSS vars (`--mx`/`--my`), conic/linear gradients, computed values.

### Framer Motion: import `m`, not `motion`

The app wraps everything in `<LazyMotion features={domAnimation}>`
(`MotionProvider.tsx`). Consequences:

- Import `m` from `framer-motion`; use `m.div`, `m.button`, etc. Importing
  `motion` re-bundles the full feature set and defeats the optimization.
- Wrap custom components with `m.create(Component)` (e.g. `m.create(Link)`), not
  `motion(Component)`.
- `AnimatePresence`, `useSpring`, `animate`, `MotionConfig` import normally.
- Only `domAnimation` features are available: animations, variants,
  exit/AnimatePresence, hover/tap/focus gestures. **No `layout`/`layoutId`/`drag`**
  — those need `domMax`.
- `MotionConfig reducedMotion="user"` is set globally, so every animation already
  respects the OS preference.
- Not `strict` mode on purpose: the embedded Sanity Studio renders full `motion`
  inside this tree.

---

## Color

Dark theme only. Amethyst is the single brand hue.

### Brand palette — `amethyst-*`

| Token | Hex | Token | Hex |
|---|---|---|---|
| `amethyst-50`  | `#f6f6f9` | `amethyst-500` | `#9c95b6` |
| `amethyst-100` | `#eeecf3` | `amethyst-600` | `#8479a0` |
| `amethyst-200` | `#dedee8` | `amethyst-700` | `#6c6284` |
| `amethyst-300` | `#cbc9da` | `amethyst-800` | `#5a516c` |
| `amethyst-400` | `#b2adc7` | `amethyst-900` | `#484257` |
|                |           | `amethyst-950` | `#2e2937` |

`--color-brand` = `amethyst-400`. Filled CTAs use `amethyst-400` (default) or
`amethyst-700` (dark) backgrounds with `amethyst-950`/`amethyst-100` text.

### Core tokens

| Token | Value | Use |
|---|---|---|
| `background` | `#0D1012` | Page background; also `themeColor` + WebGL clear |
| `surface` | `#151A1E` | Cards, raised panels, skeletons |
| `surface-blur` | `rgba(21,26,30,.50)` | Translucent surface over media |
| `text-primary` | `#F3F5F6` | Body and headings |
| `text-secondary` | `#95ABBA` | Supporting copy |
| `text-subtle` | `#5A6874` | De-emphasized / disabled |
| `error` | `#FF2244` | Validation, error states |
| `success` | `#4ade80` | Success states |
| `spotlight` | `rgba(255,255,255,.3)` | Cursor radial glow |
| `glass-bg` | `rgba(255,255,255,.04)` | Glass card fill |
| `glass-border` | `rgba(255,255,255,.08)` | Glass card edge |
| `border-hover` | `rgba(255,255,255,.25)` | Hover edge |
| `image-outline` | `rgba(255,255,255,.10)` | 1px inset edge ring on images (`.img-outline`) |
| `shadow` / `shadow-strong` | `rgba(0,0,0,.25)` / `.40` | Elevation |

---

## Typography

Self-hosted **Satoshi** via `next/font/local` (weights 300/400/500/700), exposed
as `--font-satoshi` → `--font-sans`. Inputs are pinned to `16px` to stop iOS
zoom-on-focus.

Type is **not** ad-hoc per component. Use the semantic utility classes from
`globals.css` — they bundle size, weight, tracking, leading, and responsive steps.
All scale fluidly across breakpoints and use `text-balance` on display copy.

**Headings**
- `.heading-hero` — 36 → 64px, bold, `leading-none`
- `.heading-page` — 32 → 48px, bold
- `.heading-display` — 20 → 32px, bold
- `.heading-section` — 20 → 24px, bold
- `.heading-sub` — 18 → 20px, bold
- `.heading-article` / `.heading-2` — article + section bodies
- `.heading-error` — 24 → 32px, **light**, wide tracking (error/404 voice)

**Body**
- `.text-intro` — 24 → 32px, medium (lead paragraphs)
- `.text-md` — 16 → 20px
- `.text-body` — 15 → 16px, generous `170%` leading
- `.text-body-card` — 14 → 16px, card copy
- `.text-blockquote` — italic, for pull quotes

**Labels & captions**
- `.text-caption` — 12 → 14px, medium
- `.text-eyebrow` — 11px uppercase, `0.07em` tracking
- `.text-overline` — 11px uppercase, semibold, `0.10em` tracking
- `.text-tag`, `.text-skill-label`, `.text-meta`, `.text-toc`, `.text-cursor`

**UI / component**
- `.btn-label` — 16 → 18px bold (primary button text)
- `.btn-label-flat`, `.link-label`
- `.text-field-label`, `.text-field-input`, `.text-notice`
- `.text-form-error` (12px) / `.text-form-status` (13px) — form microcopy
- `.text-testimonial-name` / `.text-testimonial-role`

Rule of thumb: if you're reaching for raw `text-[NNpx]` in a component, check
whether a semantic class already exists. Add one to `globals.css` rather than
inlining a one-off scale.

---

## Spacing, Radius & Breakpoints

Spacing uses the default Tailwind scale. Cards pad `p-5` on mobile, `tab:p-6` up.
Pills/buttons use `rounded-[8px]`; tags `rounded-lg`.

Breakpoints are custom tokens — mirror them in `layout.ts` (`BREAKPOINTS`) when a
layout decision is made in JS rather than CSS:

| Token | Width | Purpose |
|---|---|---|
| `sm` | 390px | |
| `mobile` | 600px | Compact navbar / stacked hero (**JS-read**) |
| `tab` | 730px | Compact tablet / landscape phone |
| `md` | 810px | Mobile↔tablet boundary (booking modal frame) |
| `desk` | 1088px | Compact desktop |
| `lg` | 1200px | Tablet↔desktop boundary |
| `xl` | 1440px | Widest step |

Keep `globals.css` `--breakpoint-*` and `layout.ts` in sync — they describe the
same lines from two languages.

---

## Glass Surfaces

The signature material. Defined once and reused (`.testimonial-card`,
`.cap-card`, navbar `GlassSurface`):

- Fill `bg-glass-bg`, edge `border-glass-border`
- `backdrop-filter: blur(16px) saturate(180%)` on mobile, stepping to
  `blur(32px)` at ≥730px (`tab`)
- `--shadow-glass-card`: two inset highlights (1px top light, 1px bottom dark)
  plus a deep `0 8px 32px rgba(0,0,0,.3)` drop

**ProjectCard** uses a 7-layer stacked `backdrop-filter` blur ladder
(0.5/1/2/4/8/16/32) for its progressive-blur reveal. This is deliberate — do not
collapse, reduce, or "optimize" the layer count even when paint-cost audits flag
it. It has been reverted once already.

---

## Motion

Spring-first, Apple-flavored. Shared configs live in `constants/animations.ts` —
reach for these before authoring a new transition.

**Springs**
- `SPRING_SNAP` — `{ duration: 0.18, bounce: 0 }` — instant button feedback
- `SPRING_CURSOR` — `{ stiffness: 1000, damping: 45, mass: 0.35 }` — custom cursor follow; tight tracking with a hint of ease
- `SPRING_ENTRANCE` — `{ stiffness: 120, damping: 30, mass: 1 }` — hero elements
- `SPRING_NAV` — `{ stiffness: 120, damping: 20, mass: 1.5 }` — navbar slide-up

**Easing**
- `EASE_OUT` = `[0.23, 1, 0.32, 1]` — canonical UI-entrance curve (fast start,
  smooth settle). The `.gradient-button` CSS transition reuses these exact
  coefficients as `cubic-bezier`.

**Conventions**
- `HOVER_LIFT = { y: -1 }` — 1px tactile rise on button hover. Kept as a value
  channel (`{ y }`), never a `transform` string, so it composes with concurrent
  `scale`/entrance channels instead of overriding them.
- `whileTap={{ scale: 0.96 }}` — standard press feedback on CTAs.
- `fadeUp(delay)` — scroll-triggered section entrance: `opacity 0→1`, `y 16→0`,
  `viewport once, margin -80px`, spring `{ stiffness: 260, damping: 24 }`.
- **UI-animation ceiling: ~300ms.** Interaction feedback stays snappy; durations
  were intentionally cut to stay under this.
- **Hero entrance choreography** (seconds, timed to `TextReveal` at 0.06s/word):
  subtitle `1.2`, CTA buttons `2.0`, navbar `2.4`. Plays once per session
  (`useHeroIntroPlayed`).

---

## Interaction Patterns

### Buttons — pick the right one (`SpotlightButton.tsx` header)

- **Spotlight CTA** (radial cursor glow on a filled pill) → `SpotlightButton`,
  optionally wrapped in a named component for a fixed call site (`HomeButton`,
  `ViewAllProjectsButton` — these thin wrappers are intentional, keep them).
- **Icon / nav toggle** with discrete default/hover/pressed → `useButtonState` +
  a `states` style map (`NavbarButton`, `CloseButton`, `LinkedInButton`).
- **One-off treatment** none of the above expresses (conic gradient, ripple,
  embedded modal) → bespoke component (`ContactButton`, `BookingButton`).

`useButtonState` is the shared default/hover/pressed machine; pass `isMobile` to
suppress hover on touch.

### Cursor spotlight
`useSpotlight` writes RAF-throttled `--mx`/`--my` CSS vars on the target;
`SpotlightLayer` paints the radial gradient at that point. The gradient radius and
color live in one place (`SpotlightLayer`).

### Custom cursor
`SmoothCursor` hides the native cursor (gated on `body.smooth-cursor-active`, and
only on `(any-hover: hover) and (any-pointer: fine)` devices) and follows the
pointer via `useSpring` + `SPRING_CURSOR`. Position updates drive the springs
directly on `pointermove` (no RAF batching) so tracking stays tight. Hover
morph, click press (`scale: 0.96`), and label enter/exit all reuse `SPRING_SNAP`.

Any element can opt into the expanded pill + label by setting
`data-cursor-label="…"` (e.g. `ProjectCard` → `"View project"`). Scroll
re-checks the last pointer position via RAF-throttled `elementFromPoint` so the
label clears when content moves away under a stationary cursor.

Text inputs restore the native text cursor; keyboard focus restores
`cursor: auto` so focus is always locatable. Disabled entirely when
`prefers-reduced-motion` is set.

---

## Accessibility

- **Reduced motion is first-class.** `MotionConfig reducedMotion="user"` plus
  `usePrefersReducedMotion` for imperative cases. Spinners, skeleton pulse, and
  WebGL RAF loops all branch on `prefers-reduced-motion` (static frame when set).
- **Focus visibility.** `:focus-visible` → 2px `amethyst-400` outline, 3px offset.
  Sections that receive programmatic focus from the floating nav use an inset
  ring (`outline-offset: -4px`) so it doesn't extend off-screen.
- **Inputs deliberately suppress the native focus ring** (`outline: none` on
  `:focus-visible`) — focus is instead indicated by the animated SVG
  `NotchedBorder` *inside* `FloatingLabelInput.tsx` (amethyst-400 stroke, or
  `error` on invalid; opacity brightens 0.5 → 1 on focus, animated with `EASE_OUT`
  over 0.2s). Do not restore the native ring on inputs.
- **Explicit `role="list"`** on `<ul>` with `list-style: none` — Safari+VoiceOver
  strips the implicit role, so it's re-declared on purpose (eslint scoped to allow
  it). Don't "fix" these.
- Skip-to-content link, `lang="en-GB"`, axe CI target WCAG 2.0/2.1/2.2 AA
  (`npm run a11y`).
- 6px custom scrollbar at 10% white, hover 15%.

---

## WebGL Backgrounds

OGL-driven shader backgrounds (`HeroBg`, `ContactBg`, `TestimonialsVeil`,
`NotFoundPasswordBg`) share `useWebGLBackground`: pauses RAF when off-screen,
tab-hidden, or modal-occluded (via the framework-agnostic `modal-store`); honors
reduced motion; rebuilds on GL context loss. DPR capped at 1.5 for mobile INP.
Colors come from `colors.ts` hex → `hexToRgbNormalized` (`lib/color.ts`) since CSS
vars can't reach shader uniforms. Hero shows a CSS gradient placeholder until the
first frame, then crossfades — no late pop-in, and a graceful fallback if WebGL
never paints.

---

## Conventions Recap

- Tokens over literals; semantic type classes over raw sizes.
- `m` over `motion`; shared springs over ad-hoc transitions.
- ~300ms ceiling on interaction feedback.
- Value channels (`{ y }`, `{ scale }`) over `transform` strings.
- Keep `globals.css` breakpoints and `layout.ts` in sync.
- When in doubt, the existing component for a pattern is the spec — match its
  altitude rather than inventing a parallel one.
