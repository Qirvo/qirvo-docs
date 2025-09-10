import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  basePath: '/studio',
  name: 'default',
  title: 'Qirvo Docs',

  projectId: 'x15ndwmj',
  dataset: 'qirvo-docs',

  plugins: [
    visionTool(),
    structureTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
