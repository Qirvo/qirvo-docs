import { groq } from 'next-sanity';

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    icon
  }
`;

export const categoryWithArticlesQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    title,
    "articles": *[_type == "article" && references(^._id)] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  }
`;

export const articleQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    content,
    excerpt,
    category->{
      title,
      "slug": slug.current
    }
  }
`;

export const articleSearchQuery = groq`
  *[_type == "article" && (title match $term || excerpt match $term || pt::text(content) match $term)] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    category->{
      title,
      "slug": slug.current
    }
  }
`;
