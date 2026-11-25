# ily2a.net

Personal portfolio and case study site for Ily Ameur — design engineer. Built with Next.js, TypeScript, Sanity CMS, and Tailwind CSS v4.

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Motion (`motion/react`, LazyMotion) |
| Styling | Tailwind CSS v4 (semantic type classes in `globals.css`; see design.md) |
| CMS | Sanity v6 (hosted Studio at `/studio`) |
| Email | Resend |
| Booking | Cal.com embed |
| WebGL | OGL |
| Font | Satoshi via `next/font/local` (self-hosted) |
| Analytics | Vercel Speed Insights + Analytics |
| Runtime | Node.js ≥ 24.15.0 (`engines` in `package.json`) |

## Pages

- `/` — Hero, featured projects, testimonials, capabilities, contact CTA
- `/craft` — Full project gallery
- `/craft/[slug]` — Individual case study with rich text, media, and Figma prototype embeds
- `/studio` — Sanity Studio (content management)
- `/api/contact` — Contact form submission endpoint (Resend)
- `/api/revalidate` — On-demand ISR revalidation webhook (triggered by Sanity)
- `/api/unlock` — Password gate unlock endpoint for protected case studies

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Create `.env.local` at the project root:
```env
# Sanity (Studio + content fetch)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Resend (contact form)
RESEND_API_KEY=your_resend_api_key

# Sanity → /api/revalidate webhook secret (must match the secret configured
# in the Sanity Studio webhook settings — used to authenticate publish events)
SANITY_REVALIDATION_SECRET=your_webhook_secret

# Password gate for protected case studies (compared at /api/unlock)
CASE_STUDY_PASSWORD=your_shared_password

# Optional — site URL override (defaults to https://ily2a.net for canonical/OG)
NEXT_PUBLIC_SITE_URL=https://ily2a.net

# Optional — shared secret that keys the /api/contact dedup cache so all warm
# serverless instances agree on what's already been sent. Falls back to a
# per-process random key in dev; set it in production.
DEDUP_SECRET=your_dedup_secret

# Optional — Sanity read token for the Live Content API (server-side only).
# Not required for the public published-content fetch.
SANITY_API_READ_TOKEN=your_sanity_read_token

# Optional — Sanity API version (defaults to a pinned date in src/sanity/env.ts)
NEXT_PUBLIC_SANITY_API_VERSION=2026-03-13
```

`NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are required — [src/sanity/env.ts](src/sanity/env.ts) throws on first import if either is missing, so misconfiguration fails fast with a clear message rather than surfacing as an opaque runtime error later.

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts
```bash
npm run dev         # Dev server with Turbopack
npm run build       # Production build
npm start           # Start production server
npm run lint        # Run ESLint
npm run typecheck   # Type-check with TypeScript 7 native (`@typescript/native`)
npm test            # Run Vitest once
npm run test:watch  # Run Vitest in watch mode
npm run a11y        # Run @axe-core/cli (`axe`) against http://localhost:3000 (WCAG 2.0/2.1/2.2 AA)
```

`npm run typecheck` uses TypeScript 7 via `@typescript/native`. `npm run build` still type-checks with TypeScript 6 (`typescript` → `@typescript/typescript6`) because Next.js needs the classic `typescript/lib/typescript.js` API, which TypeScript 7 does not ship. The project enables `noUncheckedIndexedAccess` on top of `strict`.

`npm run a11y` needs the server running on port 3000 and a Chrome for Testing build with a matching ChromeDriver. Install the pair once per machine with `npx browser-driver-manager@2.0.1 install chrome`. It downloads to `~/.browser-driver-manager`, which `axe` picks up automatically; rerun it to update. npm's own `chromedriver` download is turned off in `allowScripts`, because `@axe-core/cli` pins it to an older Chrome.

## Project Structure
```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── error.tsx         # Error boundary page
│   ├── loading.tsx       # Loading UI
│   ├── not-found.tsx     # 404 page
│   ├── sitemap.ts        # Dynamic sitemap
│   ├── craft/            # Project gallery + dynamic case study pages
│   ├── api/
│   │   ├── contact/      # Contact form API (Resend)
│   │   ├── revalidate/   # On-demand ISR revalidation webhook
│   │   └── unlock/       # Password gate unlock endpoint
│   └── studio/           # Embedded Sanity Studio
├── components/           # React components (grouped by role)
│   ├── auth/             # Password gate for protected case studies
│   ├── backgrounds/      # WebGL effect backgrounds
│   ├── branding/         # Logo mark
│   ├── buttons/          # Button and CTA components
│   ├── cards/            # Project cards
│   ├── effects/          # Cursor, glass, spotlight, text-reveal effects
│   ├── errors/           # Error boundary wrappers
│   ├── form/             # Form inputs
│   ├── nav/              # Navigation components
│   ├── portable-text/    # Sanity Portable Text renderers
│   ├── providers/        # App-level providers (motion, analytics)
│   └── sections/         # Home page section components
├── sanity/               # env, client, live fetch, image helpers, schemaTypes, structure
├── lib/                  # GROQ queries, API helpers, scroll, validation, dedup, …
├── hooks/                # Custom React hooks
├── data/                 # Static data (testimonials.ts)
└── constants/            # animations, colors, layout, radii, site
```

## Content Management

Case studies are managed in Sanity. Each document includes:

- **Meta** — title, slug, client, role, timeline, platform, industry, short description, tags, unique display `order`, `coverImage` (+ required alt), `cardImageDefault` / `cardImageHover`, `isPasswordProtected`
- **Context** — brief, problem statement, goals, UX strategy (rich text)
- **Content** — flexible body blocks (text + images with required alt / optional caption), Figma embed URL

To manage content, visit `/studio` in the browser or run the Sanity Studio locally:
```bash
npx sanity dev
```

Deploy schema changes:
```bash
npx sanity@latest schema deploy
```

### Data fetching: request-time vs build-time

Content is read through two helpers in [src/sanity/lib/live.ts](src/sanity/lib/live.ts), and picking the right one matters:

- **`sanityFetch` / `fetchSanityList`** — request-time. Backed by next-sanity's `defineLive`, which calls `draftMode()` internally for live preview. Use these from page components, `generateMetadata`, and route handlers — anywhere that runs inside a render/request context. `<SanityLive />` is mounted in the root layout in **development only** (it forces dynamic rendering); production content updates go through the ISR webhook.
- **`fetchSanityListStatic`** — build-time. Queries the plain published client directly. Use this from `generateStaticParams` and `sitemap`, which run at build with **no request**: calling the live fetch there throws `next-dynamic-api-wrong-context` because `draftMode()` isn't available. Don't reach for the live fetch in those functions.

## Components

**Layout & Navigation**
- **FloatingNav** — fixed bottom navbar with spring animation
- **Navbar** / **NavbarButton** — top navbar with glass surface and scroll-aware behaviour
- **GlassSurface** — navbar glass surface (`bg-surface/35`, blur 20px / saturate 300) — denser than card/panel glass; see design.md
- **Logo** — animated logo mark
- **BackToTop** — scroll-to-top utility

**Home Page Sections**
- **HeroSection** — hero with entrance animations (played once per session)
- **CraftSection** — featured projects grid on the home page
- **CapabilitiesSection** — services / capabilities list
- **TestimonialsSection** — client testimonials carousel
- **ContactSection** — contact form and CTA

**Project Cards**
- **ProjectCard** — hover card with blur overlay and image swap; handles both desktop and touch layouts

**Forms**
- **FloatingLabelInput** — text input with floating label animation, used in the contact form

**Buttons & CTAs**
- **SpotlightButton** — animated CTA button (`default`, `dark` variants)
- **HomeButton** — hero "home" CTA, extracted from SpotlightButton
- **ViewAllProjectsButton** — "view all projects" CTA, extracted from SpotlightButton
- **BookingButton** — Cal.com booking embed trigger; owns the open/close orchestration, scroll-lock, focus trap, dynamic iframe height, and a 15 s load-timeout fallback that surfaces an "open in new tab" link if the embed fails. Each open remounts the iframe (`iframeKey`) so a reopen during the exit animation still gets a fresh `onLoad`. Cal.com `postMessage` close/height events are parsed via [cal-embed-message.ts](src/lib/cal-embed-message.ts) (`fullType` from the current embed SDK and legacy `type` payloads)
- **BookingDialog** — presentational booking dialog (backdrop, framed card, spinner / error fallback, Cal.com iframe); render-only, portaled by BookingButton
- **ContactButton** / **ContactFormButton** / **MobileContactButton** — context-specific contact triggers
- **LinkedInButton** — LinkedIn profile link
- **TestimonialsButton** — hero CTA that smooth-scrolls to the testimonials section
- **NavbarButton** — navbar-specific button variant

**Visual Effects**
- **SmoothCursor** — custom cursor with tight spring tracking (`SPRING_CURSOR`); expands to a labeled pill on `data-cursor-label` hover (desktop pointer only; off when `prefers-reduced-motion`)
- **SpotlightLayer** — radial-gradient overlay painted at the `--mx` / `--my` position that `useSpotlight` tracks; the visual half of the cursor-spotlight effect, co-located so the gradient radius/color live in one place (shared by SpotlightButton, BackToTop, …)
- **HeroBg** — WebGL (OGL) shader background for the hero section; DPR capped at 1.5 for mobile INP. A CSS gradient placeholder shows until the canvas paints its first frame (`onFirstFrame`), then crossfades out — avoids a late background pop-in on cold load and stays visible as a fallback if WebGL never renders
- **ContactBg** — WebGL (OGL) aurora-style background for the contact section
- **NotFoundPasswordBg** — WebGL (OGL) background shared by the 404 and password-gate pages
- **TestimonialsBg** — lazy-loaded wrapper that defers `TestimonialsVeil` until needed
- **TestimonialsVeil** — WebGL (OGL) dark veil overlay for the testimonials section
- **TextReveal** — scroll-triggered text reveal animation

**Utility**
- **MotionProvider** — wraps the app with Motion `LazyMotion` + `domAnimation` (import `m` from `motion/react`, not the full `motion` export)
- **SpeedInsightsWrapper** — client wrapper for Vercel Speed Insights that strips `/studio` routes from reporting
- **PasswordGate** — client overlay for protected case studies (`sessionStorage` re-locks on tab close). Soft security only: the page HTML still renders server-side; this is intentional, not access control
- **PortableTextComponents** — Portable Text renderer components for Sanity rich-text fields
- **PortableTextLink** — animated external link used inside Portable Text; renders an external-link icon and an SR-only "(opens in a new tab)" announcement
- **TableOfContents** — in-page navigation for long case studies
- **ScrollToSection** — smooth-scroll anchor helper (respects `prefers-reduced-motion`)
- **CloseButton** — reusable modal/overlay close button
- **ErrorBoundary** / **SilentErrorBoundary** — React error boundary wrappers

## Design

[**design.md**](design.md) is the full design-system reference — color, typography utilities, breakpoints, glass surfaces, motion configs, interaction patterns, and accessibility conventions.

Styling uses Tailwind v4 with a custom `@theme` block in `globals.css`. Typography uses semantic classes from `globals.css` (`.heading-*`, `.text-*`, `.btn-label`, …) — see [design.md](design.md). Key tokens at a glance:

- **Brand palette** — `amethyst-*` (50–950)
- **Background** — `#0D1012`
- **Text** — `#F3F5F6`
- **Breakpoints** — `sm: 390px`, `mobile: 600px`, `tab: 730px`, `md: 810px`, `desk: 1088px`, `lg: 1200px`, `xl: 1440px` (all mirrored in JS via `BREAKPOINTS` in [layout.ts](src/constants/layout.ts))

## Constants

- **animations.ts** — shared Motion animation configs (`SPRING_SNAP`, `SPRING_CURSOR`, `SPRING_ENTRANCE`, `SPRING_NAV`, …)
- **colors.ts** — palette hex mirrors of `globals.css` tokens (`BACKGROUND`, `AMETHYST`, `MASK_BLACK`), for contexts where CSS variables can't be used (WebGL shaders, Next.js metadata strings, CSS mask stops)
- **layout.ts** — JS mirrors of every `--breakpoint-*` token (`BREAKPOINTS`)
- **radii.ts** — JS mirrors of every `--radius-*` token (`RADII`) for SVG / inline geometry
- **site.ts** — `SITE_URL`, `SITE_NAME`, `SITE_BRAND` (Google site-name / `applicationName`), `SITE_DESCRIPTION`, `CRAFT_DESCRIPTION`

## Data

- **testimonials.ts** — static testimonials array (avoids a Sanity round-trip for this rarely-changing content)

## Hooks

- **useWindowWidth** — reactive window width for responsive logic in JS
- **useButtonState** — manages hover/active state for custom button components
- **usePrefersReducedMotion** — reads `prefers-reduced-motion` media query
- **useHeroIntroPlayed** — session flag to skip hero entrance animation after first load
- **useActiveSection** — tracks which home-page section is in the viewport for nav highlighting
- **useContactForm** — manages contact form state, validation, submission, and AbortController cleanup
- **useWebGLBackground** — shared lifecycle for the OGL backgrounds: pauses the RAF loop when the canvas is off-screen, the tab is hidden, or a modal covers it; honours `prefers-reduced-motion` (one static frame); and rebuilds cleanly on GL context loss/restore. Each background supplies a `setup(container)` that returns its renderer hooks (typed as `WebGLBackgroundContext`)
- **useSpotlight** — RAF-throttled pointer tracker that writes `--mx` / `--my` CSS variables on the target element, used by buttons that paint a radial spotlight at the cursor

## Lib

- **sanity-queries.ts** — GROQ queries for case studies and home-page content
- **api.ts** — shared API helpers (sliding-window rate limiter, IP extraction, constant-time string compare) used by route handlers
- **color.ts** — `hexToRgbNormalized`, converts a design-token hex string into a `0..1` `[r, g, b]` array for WebGL `vec3` uniforms; shared by the OGL backgrounds where CSS variables can't reach
- **dedup.ts** — payload dedup cache (HMAC-SHA-256 keyed by `DEDUP_SECRET` + TTL) used by `/api/contact` so the same submission isn't sent twice when a fetch is aborted client-side after the server already started the Resend request
- **json-ld.ts** — safe JSON-LD serialiser for `<script>` injection
- **modal-store.ts** — framework-agnostic singleton (no React) tracking whether any blocking modal is open via `pushModalOpen` / `popModalOpen`; WebGL backgrounds subscribe imperatively (`subscribeToModalOpen` / `getModalOpen`) to pause their RAF loops while occluded
- **portable-text.ts** — pure helpers (`toId`, `dedupeIds`) for Portable Text content, server-safe
- **scroll.ts** — Motion-based smooth-scroll helper (`animate` from `motion/react`). Holds a module-level controller and stops any in-flight animation before starting a new one, so concurrent calls (rapid nav clicks, ToC + BackToTop overlap) don't fight for `window.scrollY`. Respects `prefers-reduced-motion`
- **cal-embed-message.ts** — parses Cal.com embed `postMessage` payloads (`CAL::__closeIframe`, `CAL::__dimensionChanged`, plus legacy `type` names) for BookingButton
- **validation.ts** — shared form validation

## Deployment

The site is designed to deploy on [Vercel](https://vercel.com). Set every variable from the [environment variables](#2-set-up-environment-variables) section in the Vercel project settings before deploying.

Image optimization is configured for `cdn.sanity.io`. The following permanent (308) redirects are in place:

- `/work` → `/craft`
- `/work/:slug` → `/craft/:slug`

### Security headers and CSP

[next.config.ts](next.config.ts) ships:

- A strict [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) for the public site (`/((?!studio).*)`), allowlisting Sanity, Cal.com (incl. Pusher websocket origins for the embed), Figma embeds, and Vercel telemetry / Live. Fonts are self-hosted; `font-src` is `'self' https://vercel.live`. The CSP tightens to your specific Sanity project's origins when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set. Dev builds also allow `'unsafe-eval'` on `script-src` for React callstacks.
- A separate, more permissive CSP scoped to `/studio(.*)` because Sanity Studio's plugin system needs `unsafe-eval` and broader connect-src. It also allows Sanity 6's UI font host (`design-system-static.sanity.io`) and helper script (`core.sanity-cdn.com`). Studio does **not** inherit the public-site HSTS / framing / permissions headers — only its CSP.
- On public routes: HSTS preload (1 year, `includeSubDomains`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` denying camera/microphone/geolocation.

### Sanity → ISR webhook

`/api/revalidate` is the on-demand revalidation endpoint. To wire it up:

1. In Sanity manage console, add a webhook on the production dataset that fires on `create`/`update`/`delete` for `caseStudy` documents.
2. Set the webhook URL to `https://<your-domain>/api/revalidate`.
3. Set the **secret** to the same value as `SANITY_REVALIDATION_SECRET` in your Vercel environment variables.
4. Set the HTTP header to `x-sanity-webhook-secret: <secret>`.

The route uses constant-time secret comparison, a pre-auth IP limit (120/hr), and a post-auth fixed-key sliding-window limit (60/hr) so a leaked secret can't drain the cache or exhaust Sanity API quota.

## Tests

Vitest is configured with the `node` environment by default ([vitest.config.ts](vitest.config.ts)). Tests live next to the code they cover under `__tests__/` folders:

- `src/app/api/__tests__/contact.test.ts`
- `src/app/api/__tests__/revalidate.test.ts`
- `src/app/api/__tests__/unlock.test.ts`
- `src/lib/__tests__/api.test.ts`
- `src/lib/__tests__/color.test.ts`
- `src/lib/__tests__/dedup.test.ts`
- `src/lib/__tests__/json-ld.test.ts`
- `src/lib/__tests__/modal-store.test.ts`
- `src/lib/__tests__/portable-text.test.ts`
- `src/lib/__tests__/scroll.test.ts`
- `src/lib/__tests__/cal-embed-message.test.ts`
- `src/lib/__tests__/validation.test.ts`
- `src/sanity/lib/__tests__/image.test.ts`
- `src/hooks/__tests__/useContactForm.test.tsx`
- `src/components/buttons/__tests__/BackToTop.test.tsx`
- `src/components/buttons/__tests__/BookingButton.test.tsx`

Components/hooks that need a DOM should add `// @vitest-environment jsdom` at the top of the test file — the default `node` environment stays fast for helper-level unit tests. Vitest 5 uses Vite’s Oxc JSX transform (`oxc.jsx.runtime: 'automatic'` in [vitest.config.ts](vitest.config.ts)).

## SEO

- **Sitemap** — App Router [src/app/sitemap.ts](src/app/sitemap.ts); pulls case study slugs from Sanity via `fetchSanityListStatic`
- **robots.txt** — static, lives at [public/robots.txt](public/robots.txt) (sitemap URL hardcoded to production `ily2a.net`)
- **JSON-LD** — root `WebSite` + `Person` from [src/app/layout.tsx](src/app/layout.tsx) (`SITE_BRAND` / `SITE_NAME`); case studies also emit `CreativeWork` on [craft/[slug]](src/app/craft/[slug]/page.tsx)
- **OG image** — site default [public/og-image.jpg](public/og-image.jpg); case studies prefer the Sanity cover (1200×630) with that file as fallback
