import blockContent from './blockContent'
import crewMember from './crewMember'
import castMember from './castMember'
import movie from './movie'
import person from './person'
import screening from './screening'
import plotSummary from './plotSummary'
import plotSummaries from './plotSummaries'

// Custom Doc Types
import category from './category'
import article from './article'

// Custom Object Types
import callout from './callout'

export const schemaTypes = [
  // Document types
  article,
  category,
  movie,
  person,
  screening,

  // Other types
  blockContent,
  callout,
  plotSummary,
  plotSummaries,
  castMember,
  crewMember,
]
