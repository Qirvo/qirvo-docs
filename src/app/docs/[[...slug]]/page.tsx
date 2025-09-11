import { getArticle, getCategoryWithArticles } from '@/sanity/api';
import { notFound, redirect } from 'next/navigation';
import { RichTextContent } from '@/components/RichTextContent';
import { Paper } from '@mantine/core';

type Props = {
  params: { slug: string[] };
};

export default async function DocPage({ params }: Props) {
  const { slug } = params;

  if (!slug || slug.length === 0) {
    // This handles the base /docs/ route. We redirect to the first article of the first category.
    // A more robust solution would be a dedicated landing page or fetching a "featured" category.
    const firstCategory = await getCategoryWithArticles('getting-started'); // A sensible default
    if (firstCategory && firstCategory.articles.length > 0) {
      redirect(`/docs/getting-started/${firstCategory.articles[0].slug}`);
    }
    notFound();
  }

  if (slug.length === 1) {
    // This is a category page, e.g., /docs/api
    // We fetch the category and redirect to its first article.
    const categorySlug = slug[0];
    const category = await getCategoryWithArticles(categorySlug);
    if (!category || !category.articles || category.articles.length === 0) {
      notFound();
    }
    const firstArticleSlug = category.articles[0].slug;
    redirect(`/docs/${categorySlug}/${firstArticleSlug}`);
  }

  if (slug.length === 2) {
    // This is an article page, e.g., /docs/api/introduction
    const articleSlug = slug[1];
    const article = await getArticle(articleSlug);

    if (!article) {
      notFound();
    }

    return (
      <Paper p="xl" radius="md" withBorder>
        <RichTextContent content={article.content} />
      </Paper>
    );
  }

  // Any other slug combination is not found
  notFound();
}
