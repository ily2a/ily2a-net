import { defineType, defineField } from 'sanity'
import { DEMO_CATALOG } from '../../demos/catalog'

// A coded, interactive demo placed in a case study body. The picker lists
// what's in src/demos/catalog.ts, so a demo shows up here once it's in code.
const liveDemo = defineType({
  name: 'liveDemo',
  title: 'Live demo',
  type: 'object',
  fields: [
    defineField({
      name: 'demo',
      title: 'Demo',
      type: 'string',
      options: {
        list: Object.entries(DEMO_CATALOG).map(([value, meta]) => ({ value, title: meta.title })),
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: { demo: 'demo', caption: 'caption' },
    prepare: ({ demo, caption }: { demo?: string; caption?: string }) => ({
      title: `Live demo: ${demo ?? '(none)'}`,
      subtitle: caption,
    }),
  },
})

export default liveDemo
