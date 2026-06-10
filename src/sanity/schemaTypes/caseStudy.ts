import { defineType, defineField } from 'sanity'

const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  groups: [
    { name: 'meta', title: '① Meta' },
    { name: 'context', title: '② Context' },
    { name: 'content', title: '③ Content' },
  ],
  fields: [

    // ── META ──
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'meta',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      group: 'meta',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      group: 'meta',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'timeline',
      title: 'Timeline',
      type: 'string',
      group: 'meta',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      group: 'meta',
      description: 'e.g. iOS, Web, Cross-platform — leave empty if not relevant',
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      group: 'meta',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: Rule => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'cardImageDefault',
      title: 'Card Image — Default',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      description: 'Shown on the project card by default',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'cardImageHover',
      title: 'Card Image — Hover / Press',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      description: 'Shown on hover (desktop) or press (mobile)',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'string',
      group: 'meta',
      description: 'One line — shown on the project card on homepage',
      validation: Rule => Rule.required().max(120),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'meta',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      group: 'meta',
      description: 'Lower numbers appear first. Must be unique — duplicates make homepage ordering non-deterministic across ISR rebuilds.',
      validation: Rule => Rule.integer().min(0).custom(async (value, context) => {
        if (value === undefined || value === null) return true
        const { document, getClient } = context
        const client = getClient({ apiVersion: '2024-01-01' })
        const id = (document?._id ?? '').replace(/^drafts\./, '')
        const conflict = await client.fetch<string | null>(
          '*[_type == "caseStudy" && order == $order && !(_id in [$draft, $published])][0]._id',
          { order: value, draft: `drafts.${id}`, published: id },
        )
        return conflict ? `Order ${value} is already used by another case study` : true
      }),
    }),
    defineField({
      name: 'isPasswordProtected',
      title: 'Password Protected',
      type: 'boolean',
      group: 'meta',
      description: 'Shows a password gate overlay on the case study page. Content requires the correct password to view.',
      initialValue: false,
    }),

    // ── CONTEXT (required on every project) ──
    defineField({
      name: 'brief',
      title: 'Business Need / Brief',
      type: 'array',
      group: 'context',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'problem',
      title: 'Problem Statement',
      type: 'array',
      group: 'context',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'goals',
      title: 'Project Goals',
      type: 'array',
      group: 'context',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'uxStrategy',
      title: 'UX Strategy',
      type: 'array',
      group: 'context',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required(),
    }),

    // ── CONTENT (flexible — images + rich text mixed freely) ──
    defineField({
      name: 'body',
      title: 'Case Study Body',
      description: 'Build freely — mix text sections and images in any order',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: Rule => Rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'figmaEmbed',
      title: 'Figma Embed URL',
      type: 'url',
      group: 'content',
      description: 'Paste the Figma share URL — will be embedded at the end of the case study',
    }),

  ],
})

export default caseStudy
