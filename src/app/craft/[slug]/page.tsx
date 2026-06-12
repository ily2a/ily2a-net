import { cache, type ElementType } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import HomeButton from '@/components/buttons/HomeButton'
import ViewAllProjectsButton from '@/components/buttons/ViewAllProjectsButton'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import FloatingNav from '@/components/nav/FloatingNav'
import BackToTop from '@/components/buttons/BackToTop'
import ContactSection from '@/components/sections/ContactSection'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import { sanityFetch, fetchSanityList } from '@/sanity/lib/live'
import { CASE_STUDY_BY_SLUG_QUERY, CASE_STUDY_SLUGS_QUERY } from '@/lib/sanity-queries'
import { urlFor, displayHeightFor, type SanityImageDimensions } from '@/sanity/lib/image'
import type { SanityImageObject } from '@sanity/image-url'
import { SITE_URL, SITE_NAME, CRAFT_DESCRIPTION } from '@/constants/site'
import { safeJsonLd } from '@/lib/json-ld'
import TableOfContents, { type TocItem } from '@/components/nav/TableOfContents'
import PasswordGate from '@/components/PasswordGate'
import { toId, dedupeIds } from '@/lib/portable-text'
import { makePtBody, ptSection } from '@/components/portable-text/PortableTextComponents'

type CoverImage = SanityImageObject & { url?: string; lqip?: string; alt?: string; dimensions?: SanityImageDimensions }

interface CaseStudyDetail {
  _id: string
  _createdAt?: string
  _updatedAt?: string
  title: string
  slug?: { current: string }
  description?: string
  client?: string
  role?: string
  timeline?: string
  platform?: string
  industry?: string
  tags?: string[]
  isPasswordProtected?: boolean
  coverImage?: CoverImage
  brief?: PortableTextBlock[]
  problem?: PortableTextBlock[]
  goals?: PortableTextBlock[]
  uxStrategy?: PortableTextBlock[]
  body?: PortableTextBlock[]
  figmaEmbed?: string
}

// ToC item during construction — extends the rendered TocItem with the
// build-only fields used to reconcile ids (block key, prototype flag).
interface TocBuildItem extends TocItem {
  _key?: string
  isPrototype?: boolean
}

interface MetaField {
  label: string
  value: string
}

interface ContextSection {
  label: string
  content: PortableTextBlock[]
}

// Deduplicated fetch — React cache() ensures generateMetadata and the page
// component share a single request per render pass.
//
// No try/catch: a thrown fetch (network/auth/rate-limit) must NOT be swallowed
// into `null`, because the caller maps null → notFound(). Letting it throw means
// a transient Sanity failure during a revalidation pass keeps the previous good
// page instead of baking (and caching) a 404. `null` is reserved strictly for
// "query succeeded, no such document".
const getCaseStudy = cache(async (slug: string): Promise<CaseStudyDetail | null> => {
  const { data } = await sanityFetch({ query: CASE_STUDY_BY_SLUG_QUERY, params: { slug } })
  return (data ?? null) as CaseStudyDetail | null
})

export async function generateStaticParams() {
  const slugs = await fetchSanityList<{ slug: string }>('craft/[slug] generateStaticParams', CASE_STUDY_SLUGS_QUERY)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getCaseStudy(slug)
  if (!data) return {}
  // Sanity covers are cropped to exactly 1200×630; the fallback banner has
  // its own native size — declare whichever is actually served.
  const ogImage = data.coverImage?.url
    ? { url: `${data.coverImage.url}?w=1200&h=630&fit=crop&auto=format`, width: 1200, height: 630 }
    : { url: '/og-image.jpg', width: 1644, height: 916 }
  const description = data.description || `${data.title} — case study by ${SITE_NAME}. ${CRAFT_DESCRIPTION}`
  return {
    title: `${data.title} — ${SITE_NAME}`,
    description,
    alternates: { canonical: `${SITE_URL}/craft/${slug}` },
    openGraph: {
      title: `${data.title} — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/craft/${slug}`,
      siteName: SITE_NAME,
      locale: 'en_GB',
      type: 'article',
      images: [{ ...ogImage, alt: `${data.title} — ${SITE_NAME}` }],
      ...(data._createdAt && { publishedTime: data._createdAt }),
      ...(data._updatedAt && { modifiedTime: data._updatedAt }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} — ${SITE_NAME}`,
      description,
      images: [{ url: ogImage.url, alt: `${data.title} — ${SITE_NAME}` }],
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const data = await getCaseStudy(slug)
  if (!data) notFound()

  const coverUrl = data.coverImage
    ? urlFor(data.coverImage).width(1400).auto('format').url()
    : null
  // Match the height attribute to the ratio the CDN actually delivers so the
  // reserved space is correct and the cover (the page's LCP element) never
  // causes a layout shift. 788 keeps the old 16:9-ish guess as fallback.
  const coverHeight = displayHeightFor(data.coverImage, data.coverImage?.dimensions, 1400, 788)

  const figmaEmbedUrl = (() => {
    const raw = data.figmaEmbed
    if (!raw) return null
    const isFigma = raw.startsWith('https://www.figma.com/') || raw.startsWith('https://embed.figma.com/')
    if (!isFigma) return null
    return raw.startsWith('https://embed.figma.com/')
      ? raw
      : `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`
  })()

  const contextSections: ContextSection[] = ([
    { label: 'Business Need', content: data.brief },
    { label: 'Problem',       content: data.problem },
    { label: 'Goals',         content: data.goals },
    { label: 'Project Strategy', content: data.uxStrategy },
  ] as { label: string; content?: PortableTextBlock[] }[])
    .filter((s): s is ContextSection => Boolean(s.content?.length))

  const bodyHeadings: TocBuildItem[] = (data.body ?? [])
    .filter(block => block._type === 'block' && typeof block.style === 'string' && ['h1', 'h2', 'h3'].includes(block.style))
    .map(block => {
      const text = (block.children as { text?: string }[] | undefined)?.map(c => c.text ?? '').join('') ?? ''
      // style is filtered to 'h1' | 'h2' | 'h3' above, so [1] is always present.
      return { _key: block._key, id: toId(text), label: text, level: parseInt((block.style as string)[1]!) }
    })
    .filter(h => h.label)

  const tocItems: TocBuildItem[] = dedupeIds<TocBuildItem>([
    ...contextSections.map((s): TocBuildItem => ({ id: toId(s.label), label: s.label, level: 2 })),
    ...bodyHeadings,
    ...(figmaEmbedUrl ? [{ id: 'prototype', label: 'Prototype', level: 2, isPrototype: true } as TocBuildItem] : []),
  ])

  // The Prototype heading is rendered with a fixed string below, but dedupeIds
  // may have suffixed its id (e.g. a body heading also slugified to 'prototype').
  // Read the deduped id back so the rendered h2 and the ToC anchor always match.
  const prototypeId = tocItems.find(t => t.isPrototype)?.id ?? 'prototype'

  // Map block._key → deduplicated id so heading renderers in PortableText
  // produce DOM ids that match the ToC anchors even when two headings share text.
  const headingIdMap = Object.fromEntries(
    tocItems
      .filter((t): t is TocBuildItem & { _key: string } => Boolean(t._key))
      .map(t => [t._key, t.id])
  )
  const ptBody = makePtBody(headingIdMap)

  const metaFields: MetaField[] = [
    { label: 'Client',   value: data.client ?? '' },
    { label: 'Role',     value: data.role ?? '' },
    { label: 'Timeline', value: data.timeline ?? '' },
    ...(data.platform ? [{ label: 'Platform', value: data.platform }] : []),
    ...(data.industry ? [{ label: 'Industry', value: data.industry }] : []),
  ]


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": data.title,
    "description": data.description,
    "url": `${SITE_URL}/craft/${slug}`,
    "author": { "@type": "Person", "name": SITE_NAME, "url": SITE_URL },
    ...(data._createdAt && { "datePublished": data._createdAt }),
    "dateModified": data._updatedAt,
    ...(data.coverImage?.url?.startsWith('https://cdn.sanity.io/') && { "image": `${data.coverImage.url}?w=1200&auto=format` }),
    ...(data.client && { "producer": { "@type": "Organization", "name": data.client } }),
  }

  return (
    <main id="main-content">
      {/* JSON-LD structured data, serialized through safeJsonLd() — trusted, not user HTML. */}
      {/* react-doctor-disable-next-line react-doctor/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      {/* PasswordGate is intentional soft security — the full page content is
          server-rendered and visible in the DOM. The gate exists as a human-facing
          friction layer (NDA/selective sharing), not as server-enforced access control. */}
      {data.isPasswordProtected && <PasswordGate />}
      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>
      <SilentErrorBoundary><BackToTop /></SilentErrorBoundary>

      <div className="w-full flex justify-center px-5 py-10 tab:px-10 tab:py-12 desk:px-14 desk:py-14 xl:px-20 xl:py-16">
        <article className="w-full max-w-[600px] flex flex-col gap-12 items-start tab:max-w-none lg:flex-row lg:gap-14 xl:max-w-[1440px]">

          {/* ── LEFT: main content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* Header */}
            <header className="flex flex-col tab:flex-row tab:justify-between tab:items-center gap-4">
              <div className="flex gap-2 shrink-0 tab:hidden">
                <ViewAllProjectsButton />
                <HomeButton />
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="heading-page text-text-primary">
                  {data.title}
                </h1>
                {data.description && (
                  <p className="text-md text-text-secondary max-w-[60ch]">{data.description}</p>
                )}
              </div>
              <div className="hidden tab:flex gap-2 shrink-0">
                <ViewAllProjectsButton />
                <HomeButton />
              </div>
            </header>

            {/* Cover image */}
            {coverUrl && (
              <div className="w-full rounded-xl overflow-hidden">
                <Image
                  src={coverUrl}
                  alt={data.coverImage?.alt || data.title}
                  width={1400}
                  height={coverHeight}
                  priority
                  // Mirrors the column width at each breakpoint (page padding,
                  // then minus the lg/xl sidebar) so retina screens stop
                  // fetching the 2× candidate for a ~900px slot.
                  sizes="(max-width: 729px) min(100vw - 40px, 600px), (max-width: 1087px) calc(100vw - 80px), (max-width: 1199px) calc(100vw - 112px), (max-width: 1439px) calc(100vw - 468px), 904px"
                  className="w-full h-auto block object-cover"
                  placeholder={data.coverImage?.lqip ? 'blur' : 'empty'}
                  blurDataURL={data.coverImage?.lqip}
                />
              </div>
            )}

            {/* Sidebar — mobile only (intentionally duplicated from desktop aside below).
                Achieving mobile-inline + desktop-sidebar with a single DOM node would
                require significant CSS restructuring; both instances are text-only so
                the duplication cost is negligible. */}
            <div className="block lg:hidden">
              <SidebarContent metaFields={metaFields} tags={data.tags} headingAs="h2" />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-10">

              {contextSections.map(({ label, content }) => (
                <section key={label} className="flex flex-col gap-[14px]">
                  <h2 id={toId(label)} className="heading-2 text-brand scroll-mt-10">{label}</h2>
                  <div className="flex flex-col gap-[10px]">
                    <PortableText value={content} components={ptSection} />
                  </div>
                </section>
              ))}

              {data.body && data.body.length > 0 && (
                <div className="flex flex-col gap-4">
                  <PortableText value={data.body} components={ptBody} />
                </div>
              )}

              {figmaEmbedUrl && (
                <div className="flex flex-col gap-3">
                  <h2 id={prototypeId} className="text-overline text-brand scroll-mt-10">
                    Prototype
                  </h2>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-glass-border shadow-[0_8px_32px_var(--color-shadow-strong)]">
                    {/* sandbox is set below; allow-same-origin+scripts is required for the Figma embed. */}
                    {/* react-doctor-disable-next-line react-doctor/iframe-missing-sandbox */}
                    <iframe
                      src={figmaEmbedUrl}
                      allowFullScreen
                      allow="fullscreen"
                      loading="lazy"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
                      title={`${data.title} — Figma prototype`}
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT: sidebar (desktop only) ── */}
          <aside
            className="hidden lg:flex lg:flex-col lg:gap-6 w-[300px] xl:w-[320px] shrink-0 self-stretch"
            aria-label="Project details"
          >
            <SidebarContent metaFields={metaFields} tags={data.tags} />
            {tocItems.length > 0 && (
              <div className="sticky top-8 self-start">
                <TableOfContents items={tocItems} />
              </div>
            )}
          </aside>

        </article>
      </div>

      <SilentErrorBoundary><ContactSection /></SilentErrorBoundary>
    </main>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({ metaFields, tags, headingAs: Heading = 'h3' }: { metaFields: MetaField[]; tags?: string[]; headingAs?: ElementType }) {
  const hasTags = !!tags && tags.length > 0
  return (
    <div
      className="flex flex-col bg-glass-bg backdrop-blur-[32px] backdrop-saturate-[180%] border border-glass-border rounded-xl p-6"
      style={{ boxShadow: 'var(--shadow-glass-card)' }}
    >
      <Heading className="heading-article text-brand">
        Project Details
      </Heading>

      {hasTags && (
        // role="list" re-declared intentionally: Safari+VoiceOver drops the implicit
        // list role when list-style is removed.
        // react-doctor-disable-next-line react-doctor/no-redundant-roles
        <ul className="flex flex-wrap gap-[6px] list-none p-0 m-0 mt-3" role="list">
          {tags.map((tag) => (
            <li key={tag} className="project-card__tag">{tag}</li>
          ))}
        </ul>
      )}

      <dl className={`flex flex-col gap-3 ${hasTags ? 'mt-4' : 'mt-3'}`}>
        {metaFields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="text-caption text-text-secondary">
              {label}
            </dt>
            <dd className="text-meta text-text-primary">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
