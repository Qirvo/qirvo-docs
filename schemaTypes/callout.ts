import {defineType, defineField} from 'sanity'
import {MdInfo as icon} from 'react-icons/md'

export default defineType({
  name: 'callout',
  title: 'Callout Box',
  type: 'object',
  icon,
  fields: [
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Info', value: 'info'},
          {title: 'Warning', value: 'warning'},
          {title: 'Success', value: 'success'},
          {title: 'Danger', value: 'danger'},
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}], // Simple rich text for the callout content
    }),
  ],
  preview: {
    select: {
      style: 'style',
      content: 'content',
    },
    prepare({style, content}) {
      const text = content?.[0]?.children?.[0]?.text || 'No content'
      return {
        title: `Callout: ${style.charAt(0).toUpperCase() + style.slice(1)}`,
        subtitle: text,
        icon,
      }
    },
  },
})
