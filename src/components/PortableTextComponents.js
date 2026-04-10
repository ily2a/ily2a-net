import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { toId } from '@/lib/portable-text'

// Portable Text component overrides used by case-study pages.
//
// Three flavours:
//   ptBase    — minimal block + list rules shared by all variants
//   ptBody    — full body content: headings, blockquote, image figures, links, marks
//   ptSection — short context blurbs (Brief / Problem / Goals / Strategy);
//               no headings, only inline marks

const ptBase = {
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
}

export const ptBody = {
  block: {
    ...ptBase.block,
    h1: ({ children, value }) => {
      // Render as h2 — the page already has an h1 for the project title,
      // so a second h1 in body content would be invalid HTML and hurt SEO.
      const text = value?.children?.map(c => c.text).join('') ?? ''
      return <h2 id={toId(text)} className="heading-display text-brand scroll-mt-10">{children}</h2>
    },
    h2: ({ children, value }) => {
      const text = value?.children?.map(c => c.text).join('') ?? ''
      return <h2 id={toId(text)} className="heading-2 text-brand scroll-mt-10">{children}</h2>
    },
    h3: ({ children, value }) => {
      const text = value?.children?.map(c => c.text).join('') ?? ''
      return <h3 id={toId(text)} className="heading-article text-brand scroll-mt-10">{children}</h3>
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-brand pl-5 text-text-primary text-blockquote">
        {children}
      </blockquote>
    ),
  },
  list:     ptBase.list,
  listItem: ptBase.listItem,
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
            sizes="(max-width: 600px) 100vw, (max-width: 1088px) 90vw, 900px"
            className="w-full h-auto rounded-xl block"
            placeholder={value.lqip ? 'blur' : 'empty'}
            blurDataURL={value.lqip}
          />
          {value.caption && (
            <figcaption className="text-caption text-text-subtle text-center">
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
      const href = /^(https?|mailto|tel):/.test(value?.href ?? '') ? value.href : null
      if (!href) return <span className="text-brand">{children}</span>
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

export const ptSection = {
  ...ptBase,
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em:     ({ children }) => <em>{children}</em>,
  },
}
