import Image from 'next/image'
import type { ReactNode } from 'react'
import type {
  PortableTextComponents,
  PortableTextComponentProps,
  PortableTextMarkComponentProps,
  PortableTextTypeComponentProps,
  PortableTextBlock,
} from '@portabletext/react'
import type { TypedObject } from '@portabletext/types'
import type { SanityImageObject } from '@sanity/image-url'
import { urlFor, displayHeightFor, type SanityImageDimensions } from '@/sanity/lib/image'
import { toId } from '@/lib/portable-text'
import PortableTextLink from '@/components/portable-text/PortableTextLink'

// Portable Text component overrides used by case-study pages.
//
// Three flavours:
//   ptBase    — minimal block + list rules shared by all variants
//   ptBody    — full body content: headings, blockquote, image figures, links, marks
//   ptSection — short context blurbs (Brief / Problem / Goals / Strategy);
//               no headings, only inline marks
//
// makePtBody(headingIdMap) — factory variant that resolves heading ids from a
//   pre-deduplicated map keyed by block._key. Pass this when the page builds a
//   Table of Contents with dedupeIds() so that DOM ids match ToC anchors even
//   when two headings share the same text.

// Image block value as authored in the caseStudy schema — a Sanity image with
// alt/caption plus the lqip placeholder projected by the GROQ query.
interface CaseStudyImageValue extends SanityImageObject {
  alt?: string
  caption?: string
  lqip?: string
  dimensions?: SanityImageDimensions
}

interface LinkMark extends TypedObject {
  href?: string
}

const getBlockText = (value: PortableTextBlock): string =>
  (value.children as { text?: string }[] | undefined)?.map(c => c.text ?? '').join('') ?? ''

// Inline code. overflow-wrap:anywhere is required, not cosmetic: tokens like
// `Semantics/Components/button/primary` have no break opportunity (slashes don't
// break by default), so a bare <code> sets a min-content wider than a phone column
// and overflows the page. `anywhere` lets it wrap and keeps the column shrinkable.
const InlineCode = ({ children }: { children?: ReactNode }) => (
  <code className="rounded-md border border-glass-border bg-glass-bg px-1.5 py-0.5 font-mono text-[0.85em] text-text-primary [overflow-wrap:anywhere]">
    {children}
  </code>
)

const ptBase = {
  block: {
    normal: ({ children, value }: PortableTextComponentProps<PortableTextBlock>) => {
      const text = getBlockText(value)
      if (!text.trim()) return <div className="h-4" />
      return <p className="text-md text-text-primary">{children}</p>
    },
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => <ul className="list-disc pl-5 flex flex-col gap-1 text-md text-text-primary">{children}</ul>,
    number: ({ children }: { children?: ReactNode }) => <ol className="list-decimal pl-5 flex flex-col gap-1 text-md text-text-primary">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  },
}

export function makePtBody(headingIdMap: Record<string, string> = {}): PortableTextComponents {
  // Resolve the id for a heading block. If the block's _key is in the map
  // (meaning dedupeIds renamed it), use the deduplicated value. Otherwise
  // fall back to computing from text — keeps behaviour identical when no
  // deduplication was needed.
  const getId = (value: PortableTextBlock): string => {
    const mapped = value._key ? headingIdMap[value._key] : undefined
    if (mapped) return mapped
    return toId(getBlockText(value))
  }

  return {
    block: {
      ...ptBase.block,
      h1: ({ children, value }: PortableTextComponentProps<PortableTextBlock>) => (
        <h2 id={getId(value)} className="heading-display text-brand scroll-mt-10">{children}</h2>
      ),
      h2: ({ children, value }: PortableTextComponentProps<PortableTextBlock>) => (
        <h2 id={getId(value)} className="heading-2 text-brand scroll-mt-10">{children}</h2>
      ),
      h3: ({ children, value }: PortableTextComponentProps<PortableTextBlock>) => (
        <h3 id={getId(value)} className="heading-article text-brand scroll-mt-10">{children}</h3>
      ),
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="border-l-2 border-brand pl-5 text-text-primary text-blockquote">
          {children}
        </blockquote>
      ),
    },
    list:     ptBase.list,
    listItem: ptBase.listItem,
    types: {
      image: ({ value }: PortableTextTypeComponentProps<CaseStudyImageValue>) => {
        const url = urlFor(value).width(1200).auto('format').url()
        // Reserve space at the image's real delivered ratio (crop-aware) so
        // non-16:9 uploads don't shift the article when they load.
        const height = displayHeightFor(value, value.dimensions, 1200, 675)
        return (
          <figure className="flex flex-col gap-2.5 w-full">
            <Image
              src={url}
              alt={value.alt || value.caption || ''}
              width={1200}
              height={height}
              sizes="(max-width: 600px) 100vw, (max-width: 1088px) 90vw, 900px"
              className="w-full h-auto rounded-xl block"
              placeholder={value.lqip ? 'blur' : 'empty'}
              blurDataURL={value.lqip}
            />
            {value.caption && (
              <figcaption className="text-caption text-text-secondary text-center">
                {value.caption}
              </figcaption>
            )}
          </figure>
        )
      },
    },
    marks: {
      strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
      em:     ({ children }: { children?: ReactNode }) => <em>{children}</em>,
      code:   InlineCode,
      link:   ({ value, children }: PortableTextMarkComponentProps<LinkMark>) => {
        const href = /^(https?|mailto|tel):/.test(value?.href ?? '') ? (value?.href ?? null) : null
        if (!href) return <span className="text-brand">{children}</span>
        return <PortableTextLink href={href}>{children}</PortableTextLink>
      },
    },
  }
}

export const ptSection: PortableTextComponents = {
  ...ptBase,
  marks: {
    strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
    em:     ({ children }: { children?: ReactNode }) => <em>{children}</em>,
    code:   InlineCode,
  },
}
