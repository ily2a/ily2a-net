# ily2a.net

Personal portfolio and case study site for Ily Ameur — design engineer. Built with Next.js, Sanity CMS, and Tailwind CSS v4.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Framer Motion |
| Styling | Tailwind CSS v4 (inline utilities, no custom font classes) |
| CMS | Sanity v5 (hosted Studio at `/studio`) |
| Email | Resend |
| Booking | Cal.com embed |
| WebGL | OGL |
| Font | Satoshi via Fontshare |
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
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
RESEND_API_KEY=your_resend_api_key
```

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts
```bash
npm run dev      # Dev server with Turbopack
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Project Structure
```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── page.js           # Home page
│   ├── craft/            # Project gallery + dynamic case study pages
│   ├── api/
│   │   ├── contact/      # Contact form API (Resend)
│   │   ├── revalidate/   # On-demand ISR revalidation webhook
│   │   └── unlock/       # Password gate unlock endpoint
│   └── studio/           # Embedded Sanity Studio
├── components/           # React components
├── sanity/               # Sanity client, schema types, image helpers
├── lib/                  # GROQ queries, utilities
├── hooks/                # Custom React hooks
└── constants/            # Framer Motion animation configs
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

## Components

**Layout & Navigation**
- **FloatingNav** — fixed bottom navbar with spring animation
- **Navbar** / **NavbarButton** — top navbar with glass surface and scroll-aware behaviour
- **GlassSurface** — SVG displacement filter glass effect used in the navbar
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

**Buttons & CTAs**
- **SpotlightButton** — animated CTA button (`default`, `dark`, `ghost` variants)
- **BookingButton** — Cal.com booking embed trigger
- **ContactButton** / **ContactFormButton** / **MobileContactButton** — context-specific contact triggers
- **LinkedInButton** — LinkedIn profile link
- **TestimonialsButton** — opens testimonials modal/section
- **NavbarButton** — navbar-specific button variant

**Visual Effects**
- **SmoothCursor** — custom cursor that expands on project card hover (desktop pointer only)
- **Aurora** — animated aurora background effect
- **LineWaves** / **LineWavesBackground** — SVG line-wave decorative background
- **GradientBlinds** — animated gradient overlay
- **DarkVeil** — dark overlay used for transitions
- **TextReveal** — scroll-triggered text reveal animation

**Utility**
- **MotionProvider** — wraps the app with Framer Motion `LazyMotion` provider
- **PasswordGate** — locks protected case studies behind a password
- **TableOfContents** — in-page navigation for long case studies
- **ScrollToSection** — smooth-scroll anchor helper
- **CloseButton** — reusable modal/overlay close button
- **ErrorBoundary** / **SilentErrorBoundary** — React error boundary wrappers

## Design Tokens

Styling uses Tailwind v4 with a custom `@theme` block in `globals.css`. All typography is inlined as Tailwind utilities — no custom font classes. Key tokens:

- **Brand palette** — `amethyst-*` (50–950)
- **Background** — `#0D1012`
- **Text** — `#F3F5F6`
- **Breakpoints** — `tab: 730px`, `desk: 1200px`, `xl: 1440px`

## Hooks

- **useWindowWidth** — reactive window width for responsive logic in JS
- **useButtonState** — manages hover/active state for custom button components
- **usePrefersReducedMotion** — reads `prefers-reduced-motion` media query
- **useHeroIntroPlayed** — session flag to skip hero entrance animation after first load

## Deployment

The site is designed to deploy on [Vercel](https://vercel.com). Set the environment variables in the Vercel project settings before deploying.

Image optimization is configured for `cdn.sanity.io`. The following redirects are in place:

- `/work` → `/craft`
- `/work/:slug` → `/craft/:slug`
