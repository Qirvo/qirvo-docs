import {defineField, defineType} from 'sanity'
import {MdArticle as icon} from 'react-icons/md'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent', // Reusing the existing blockContent schema
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'A short summary of the article used for search results and previews.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
    },
    prepare(selection) {
      const {title, category} = selection
      return {
        title,
        subtitle: category ? `in ${category}` : 'Uncategorized',
      }
    },
  },
})
