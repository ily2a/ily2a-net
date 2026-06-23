# ily2a.net

Personal portfolio and case study site for Ily Ameur — design engineer. Built with Next.js, TypeScript, Sanity CMS, and Tailwind CSS v4.

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Framer Motion |
| Styling | Tailwind CSS v4 (inline utilities, no custom font classes) |
| CMS | Sanity v5 (hosted Studio at `/studio`) |
| Email | Resend |
| Booking | Cal.com embed |
| WebGL | OGL |
| Font | Satoshi via `next/font/local` (self-hosted) |
| Analytics | Vercel Speed Insights + Analytics |

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

`NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are required — [src/sanity/env.ts](src/sanity/env.ts) throws at startup if either is missing, so misconfiguration fails fast with a clear message rather than surfacing as an opaque runtime error later.

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
npm run typecheck   # Type-check with tsc (no emit)
npm test            # Run Vitest once
npm run test:watch  # Run Vitest in watch mode
npm run a11y        # Run axe-cli against http://localhost:3000 (WCAG 2.0/2.1/2.2 AA)
```

Type-checking also runs as part of `npm run build` (Next.js type-checks during the build). To type-check on its own: `npm run typecheck`. The project enables `noUncheckedIndexedAccess` on top of `strict`.

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
│   ├── backgrounds/      # WebGL effect backgrounds
│   ├── buttons/          # Button and CTA components
│   ├── effects/          # Cursor, glass, spotlight, text-reveal effects
│   ├── errors/           # Error boundary wrappers
│   ├── form/             # Form inputs
│   ├── nav/              # Navigation components
│   ├── portable-text/    # Sanity Portable Text renderers
│   ├── providers/        # App-level providers (motion, analytics)
│   └── sections/         # Home page section components
├── sanity/               # Sanity client, schema types, image helpers
├── lib/                  # GROQ queries (sanity-queries.ts), validation
├── hooks/                # Custom React hooks
├── data/                 # Static data (testimonials.ts)
└── constants/            # Framer Motion animation configs, layout/site constants
```

## Content Management

Case studies are managed in Sanity. Each document includes:

- **Meta** — title, slug, client, role, timeline, platform, industry, tags, cover/card images
- **Context** — brief, problem statement, goals, UX strategy (rich text)
- **Content** — flexible body blocks (text + images), Figma embed URL

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

- **`sanityFetch` / `fetchSanityList`** — request-time. Backed by next-sanity's `defineLive`, which calls `draftMode()` internally for live preview. Use these from page components, `generateMetadata`, and route handlers — anywhere that runs inside a render/request context.
- **`fetchSanityListStatic`** — build-time. Queries the plain published client directly. Use this from `generateStaticParams` and `sitemap`, which run at build with **no request**: calling the live fetch there throws `next-dynamic-api-wrong-context` because `draftMode()` isn't available. Don't reach for the live fetch in those functions.

## Components

**Layout & Navigation**
- **FloatingNav** — fixed bottom navbar with spring animation
- **Navbar** / **NavbarButton** — top navbar with glass surface and scroll-aware behaviour
- **GlassSurface** — frosted-glass surface (CSS `backdrop-blur` + saturate) used in the navbar
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
- **BookingButton** — Cal.com booking embed trigger; owns the open/close orchestration, scroll-lock, focus trap, dynamic iframe height, and a 15 s load-timeout fallback that surfaces an "open in new tab" link if the embed fails
- **BookingDialog** — presentational booking dialog (backdrop, framed card, spinner / error fallback, Cal.com iframe); render-only, lazy-loaded by BookingButton
- **ContactButton** / **ContactFormButton** / **MobileContactButton** — context-specific contact triggers
- **LinkedInButton** — LinkedIn profile link
- **TestimonialsButton** — hero CTA that smooth-scrolls to the testimonials section
- **NavbarButton** — navbar-specific button variant

**Visual Effects**
- **SmoothCursor** — custom cursor that expands on project card hover (desktop pointer only)
- **SpotlightLayer** — radial-gradient overlay painted at the `--mx` / `--my` position that `useSpotlight` tracks; the visual half of the cursor-spotlight effect, co-located so the gradient radius/color live in one place (shared by SpotlightButton, BackToTop, …)
- **HeroBg** — WebGL (OGL) shader background for the hero section; DPR capped at 1.5 for mobile INP. A CSS gradient placeholder shows until the canvas paints its first frame (`onFirstFrame`), then crossfades out — avoids a late background pop-in on cold load and stays visible as a fallback if WebGL never renders
- **ContactBg** — WebGL (OGL) aurora-style background for the contact section
- **NotFoundPasswordBg** — WebGL (OGL) background shared by the 404 and password-gate pages
- **TestimonialsBg** — lazy-loaded wrapper that defers `TestimonialsVeil` until needed
- **TestimonialsVeil** — WebGL (OGL) dark veil overlay for the testimonials section
- **TextReveal** — scroll-triggered text reveal animation

**Utility**
- **MotionProvider** — wraps the app with Framer Motion `LazyMotion` provider
- **SpeedInsightsWrapper** — client wrapper for Vercel Speed Insights that strips `/studio` routes from reporting
- **PasswordGate** — locks protected case studies behind a password; uses `sessionStorage` so the gate re-locks on tab close
- **PortableTextComponents** — Portable Text renderer components for Sanity rich-text fields
- **PortableTextLink** — animated external link used inside Portable Text; renders an external-link icon and an SR-only "(opens in a new tab)" announcement
- **TableOfContents** — in-page navigation for long case studies
- **ScrollToSection** — smooth-scroll anchor helper (respects `prefers-reduced-motion`)
- **CloseButton** — reusable modal/overlay close button
- **ErrorBoundary** / **SilentErrorBoundary** — React error boundary wrappers

## Design

[**design.md**](design.md) is the full design-system reference — color, typography utilities, breakpoints, glass surfaces, motion configs, interaction patterns, and accessibility conventions.

Styling uses Tailwind v4 with a custom `@theme` block in `globals.css`. All typography is inlined as Tailwind utilities — no custom font classes. Key tokens at a glance:

- **Brand palette** — `amethyst-*` (50–950)
- **Background** — `#0D1012`
- **Text** — `#F3F5F6`
- **Breakpoints** — `sm: 390px`, `mobile: 600px` (JS-only), `tab: 730px`, `md: 810px`, `desk: 1088px`, `lg: 1200px`, `xl: 1440px`

## Constants

- **animations.ts** — shared Framer Motion animation configs
- **colors.ts** — palette hex mirrors of `globals.css` tokens, for contexts where CSS variables can't be used (WebGL shaders, Next.js metadata strings)
- **layout.ts** — layout constants (JS-only breakpoints)
- **site.ts** — site URL, name, and meta description constants

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
- **scroll.ts** — Framer Motion-based smooth-scroll helper. Holds a module-level controller and stops any in-flight animation before starting a new one, so concurrent calls (rapid nav clicks, ToC + BackToTop overlap) don't fight for `window.scrollY`. Respects `prefers-reduced-motion`
- **validation.ts** — shared form validation

## Deployment

The site is designed to deploy on [Vercel](https://vercel.com). Set every variable from the [environment variables](#2-set-up-environment-variables) section in the Vercel project settings before deploying.

Image optimization is configured for `cdn.sanity.io`. The following permanent (308) redirects are in place:

- `/work` → `/craft`
- `/work/:slug` → `/craft/:slug`

### Security headers and CSP

[next.config.ts](next.config.ts) ships:

- A strict [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) for the public site, allowlisting only the third-party origins actually used (Sanity, Cal.com, Figma embeds, Vercel telemetry). Fonts are self-hosted, so `font-src` stays on `'self'`. The CSP tightens to your specific Sanity project's origins when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.
- A separate, more permissive CSP scoped to `/studio(.*)` because Sanity Studio's plugin system needs `unsafe-eval` and broader connect-src.
- HSTS preload (1 year, `includeSubDomains`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` denying camera/microphone/geolocation.

### Sanity → ISR webhook

`/api/revalidate` is the on-demand revalidation endpoint. To wire it up:

1. In Sanity manage console, add a webhook on the production dataset that fires on `create`/`update`/`delete` for `caseStudy` documents.
2. Set the webhook URL to `https://<your-domain>/api/revalidate`.
3. Set the **secret** to the same value as `SANITY_REVALIDATION_SECRET` in your Vercel environment variables.
4. Set the HTTP header to `x-sanity-webhook-secret: <secret>`.

The route uses constant-time secret comparison and a fixed-key sliding-window rate limit (60/hr) so a leaked secret can't drain the cache or exhaust Sanity API quota.

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
- `src/lib/__tests__/validation.test.ts`
- `src/sanity/lib/__tests__/image.test.ts`
- `src/hooks/__tests__/useContactForm.test.tsx`
- `src/components/buttons/__tests__/BackToTop.test.tsx`

Components/hooks that need a DOM should add `// @vitest-environment jsdom` at the top of the test file — the default `node` environment stays fast for helper-level unit tests.

## SEO

- **Sitemap** — generated at build time by [src/app/sitemap.ts](src/app/sitemap.ts); pulls case study slugs from Sanity
- **robots.txt** — static, lives at [public/robots.txt](public/robots.txt)
- **JSON-LD** — `WebSite` + `Person` graph injected from [src/app/layout.tsx](src/app/layout.tsx); the `WebSite.name` controls Google's site-name display in search results
- **OG image** — static [public/og-image.jpg](public/og-image.jpg) referenced from `metadata.openGraph` and `metadata.twitter`
