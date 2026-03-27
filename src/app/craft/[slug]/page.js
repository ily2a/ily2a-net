import { cache } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import SpotlightButton from '@/components/SpotlightButton'
import { PortableText } from '@portabletext/react'
import FloatingNav from '@/components/FloatingNav'
import BackToTop from '@/components/BackToTop'
import ContactSection from '@/components/ContactSection'
import SilentErrorBoundary from '@/components/SilentErrorBoundary'
import { sanityFetch } from '@/sanity/lib/live'
import { CASE_STUDY_BY_SLUG_QUERY, CASE_STUDY_SLUGS_QUERY } from '@/lib/sanity-queries'
import { urlFor } from '@/sanity/lib/image'
import { SITE_URL, SITE_NAME } from '@/constants/site'

// Deduplicated fetch — React cache() ensures generateMetadata and the page
// component share a single request per render pass.
const getCaseStudy = cache(async (slug) => {
  try {
    const { data } = await sanityFetch({ query: CASE_STUDY_BY_SLUG_QUERY, params: { slug } })
    return data ?? null
  } catch {
    return null
  }
})

export async function generateStaticParams() {
  try {
    const { data } = await sanityFetch({ query: CASE_STUDY_SLUGS_QUERY })
    return (data ?? []).map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getCaseStudy(slug)
  if (!data) return {}
  const ogImage = data.coverImage?.url
    ? `${data.coverImage.url}?w=1200&h=630&fit=crop&auto=format`
    : '/og-image.png'
  return {
    title: `${data.title} — ${SITE_NAME}`,
    description: data.description,
    alternates: { canonical: `${SITE_URL}/craft/${slug}` },
    openGraph: {
      title: `${data.title} — ${SITE_NAME}`,
      description: data.description,
      url: `${SITE_URL}/craft/${slug}`,
      siteName: SITE_NAME,
      locale: 'en_GB',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} — ${SITE_NAME}`,
      description: data.description,
      images: [ogImage],
    },
  }
}

// ── Portable Text ─────────────────────────────────────────────────────────────

const ptBody = {
  block: {
    normal:     ({ children, value }) => {
      const text = value?.children?.map(c => c.text).join('') ?? ''
      if (!text.trim()) return <div className="h-4" />
      return <p className="font-normal tracking-[0.07em] leading-[150%] text-[16px] lg:text-[18px] xl:text-[20px] text-balance text-text-primary">{children}</p>
    },
    h1:         ({ children }) => <h1 className="font-bold tracking-[-0.01em] leading-[130%] text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] text-balance text-brand">{children}</h1>,
    h2:         ({ children }) => <h2 className="font-bold tracking-[-0.01em] leading-[130%] text-[18px] md:text-[20px] lg:text-[24px] xl:text-[28px] text-balance text-brand">{children}</h2>,
    h3:         ({ children }) => <h3 className="font-bold tracking-[-0.01em] leading-[130%] text-[16px] md:text-[16px] lg:text-[18px] xl:text-[24px] text-balance text-brand">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-brand pl-5 text-text-primary italic text-base leading-[160%] tracking-[0.04em]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet:   ({ children }) => <ul className="list-disc pl-5 flex flex-col gap-1 font-normal tracking-[0.07em] leading-[150%] text-[16px] lg:text-[18px] xl:text-[20px] text-balance text-text-primary">{children}</ul>,
    number:   ({ children }) => <ol className="list-decimal pl-5 flex flex-col gap-1 font-normal tracking-[0.07em] leading-[150%] text-[16px] lg:text-[18px] xl:text-[20px] text-balance text-text-primary">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  types: {
    image: ({ value }) => {
      const url = urlFor(value).width(1200).auto('format').url()
      return (
        <figure className="flex flex-col gap-2.5 w-full">
          <Image
            src={url}
            alt={value.alt || value.caption || ''}
            width={1200}
            height={675}
            className="w-full h-auto rounded-xl block"
            placeholder={value.lqip ? 'blur' : 'empty'}
            blurDataURL={value.lqip}
          />
          {value.caption && (
            <figcaption className="font-medium leading-[150%] text-[12px] md:text-[13px] xl:text-[14px] text-balance text-text-subtle tracking-[0.04em] text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em:     ({ children }) => <em>{children}</em>,
    link:   ({ value, children }) => {
      const href = /^(https?|mailto|tel):/.test(value?.href ?? '') ? value.href : '#'
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          {children}
        </a>
      )
    },
  },
}

const ptSection = {
  block: {
    normal: ({ children, value }) => {
      const text = value?.children?.map(c => c.text).join('') ?? ''
      if (!text.trim()) return <div className="h-4" />
      return <p className="text-md text-text-primary">{children}</p>
    },
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 flex flex-col gap-1 text-md text-text-primary">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 flex flex-col gap-1 text-md text-text-primary">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em:     ({ children }) => <em>{children}</em>,
  },
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CaseStudyPage({ params }) {
  const { slug } = await params

  const data = await getCaseStudy(slug)
  if (!data) notFound()

  const coverUrl = data.coverImage
    ? urlFor(data.coverImage).width(1400).auto('format').url()
    : null

  const figmaEmbedUrl = (() => {
    const raw = data.figmaEmbed
    if (!raw) return null
    const isFigma = raw.startsWith('https://www.figma.com/') || raw.startsWith('https://embed.figma.com/')
    if (!isFigma) return null
    return raw.startsWith('https://embed.figma.com/')
      ? raw
      : `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`
  })()

  const contextSections = [
    { label: 'Business Need', content: data.brief },
    { label: 'Problem',       content: data.problem },
    { label: 'Goals',         content: data.goals },
    { label: 'Project Strategy', content: data.uxStrategy },
  ].filter((s) => s.content?.length)

  const metaFields = [
    { label: 'Client',   value: data.client },
    { label: 'Role',     value: data.role },
    { label: 'Timeline', value: data.timeline },
    data.platform && { label: 'Platform', value: data.platform },
    data.industry && { label: 'Industry', value: data.industry },
  ].filter(Boolean)


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": data.title,
    "description": data.description,
    "url": `${SITE_URL}/craft/${data.slug.current}`,
    "author": { "@type": "Person", "name": SITE_NAME, "url": SITE_URL },
    "dateModified": data._updatedAt,
    ...(data.coverImage?.url && { "image": `${data.coverImage.url}?w=1200&auto=format` }),
    ...(data.client && { "producer": { "@type": "Organization", "name": data.client } }),
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }} />
      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>
      <SilentErrorBoundary><BackToTop /></SilentErrorBoundary>

      <div className="w-full flex justify-center px-5 py-10 tab:px-10 tab:py-12 desk:px-14 desk:py-14 xl:px-20 xl:py-16">
        <article className="w-full max-w-[600px] flex flex-col gap-12 items-start tab:max-w-none lg:flex-row lg:gap-14 xl:max-w-[1440px]">

          {/* ── LEFT: main content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* Header */}
            <header className="flex flex-col tab:flex-row tab:justify-between tab:items-center gap-4">
              <div className="flex gap-2 shrink-0 tab:hidden">
                <SpotlightButton href="/craft" variant="dark">View all projects</SpotlightButton>
                <SpotlightButton href="/">Home</SpotlightButton>
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] tracking-[-0.02em] leading-[115%] text-text-primary text-balance">
                  {data.title}
                </h1>
                {data.description && (
                  <p className="text-md text-text-secondary max-w-[60ch]">{data.description}</p>
                )}
              </div>
              <div className="hidden tab:flex gap-2 shrink-0">
                <SpotlightButton href="/craft" variant="dark">View all projects</SpotlightButton>
                <SpotlightButton href="/">Home</SpotlightButton>
              </div>
            </header>

            {/* Cover image */}
            {coverUrl && (
              <div className="w-full rounded-xl overflow-hidden">
                <Image
                  src={coverUrl}
                  alt={data.coverImage?.alt || data.title}
                  width={1400}
                  height={788}
                  priority
                  className="w-full h-auto block object-cover"
                  placeholder={data.coverImage?.lqip ? 'blur' : 'empty'}
                  blurDataURL={data.coverImage?.lqip}
                />
              </div>
            )}

            {/* Sidebar — mobile only */}
            <div className="block lg:hidden">
              <SidebarContent metaFields={metaFields} tags={data.tags} />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-10">

              {contextSections.map(({ label, content }) => (
                <section key={label} className="flex flex-col gap-[14px]">
                  <h2 className="heading-2 text-brand">{label}</h2>
                  <div className="flex flex-col gap-[10px]">
                    <PortableText value={content} components={ptSection} />
                  </div>
                </section>
              ))}

              {data.body?.length > 0 && (
                <div className="flex flex-col gap-4">
                  <PortableText value={data.body} components={ptBody} />
                </div>
              )}

              {figmaEmbedUrl && (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-brand">
                    Prototype
                  </p>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <iframe
                      src={figmaEmbedUrl}
                      allowFullScreen
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
            className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-24"
            aria-label="Project details"
          >
            <SidebarContent metaFields={metaFields} tags={data.tags} />
          </aside>

        </article>
      </div>

      <SilentErrorBoundary><ContactSection /></SilentErrorBoundary>
    </main>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({ metaFields, tags }) {
  return (
    <div
      className="flex flex-col bg-white/[0.04] backdrop-blur-[32px] backdrop-saturate-[180%] border border-white/[0.08] rounded-xl p-6"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.3)' }}
    >
      <p className="font-bold tracking-[-0.01em] leading-[130%] text-[16px] md:text-[16px] lg:text-[18px] xl:text-[24px] text-balance text-brand">
        Project Details
      </p>

      {tags?.length > 0 && (
        <ul className="flex flex-wrap gap-[6px] list-none p-0 m-0 mt-3" role="list">
          {tags.map((tag) => (
            <li key={tag} className="project-card__tag">{tag}</li>
          ))}
        </ul>
      )}

      <dl className={`flex flex-col gap-3 ${tags?.length > 0 ? 'mt-4' : 'mt-3'}`}>
        {metaFields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="font-medium tracking-[0.07em] leading-[150%] text-[12px] md:text-[13px] xl:text-[14px] text-balance text-text-secondary">
              {label}
            </dt>
            <dd className="text-[15px] font-medium tracking-[-0.01em] text-text-primary leading-[1.3]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
