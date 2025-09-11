import { AppShell, Group, NavLink, ScrollArea, Title } from '@mantine/core';
import { getCategoryWithArticles, getArticle } from '@/sanity/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import classes from './layout.module.css';
import { TableOfContents, TocHeading } from '@/components/TableOfContents';

// Helper to slugify strings for IDs
const slugify = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const extractHeadings = (content: any[]): TocHeading[] => {
  if (!content) return [];
  return content
    .filter((block) => block._type === 'block' && ['h2', 'h3', 'h4'].includes(block.style))
    .map((block) => ({
      text: block.children.map((span: any) => span.text).join(''),
      level: parseInt(block.style.replace('h', ''), 10),
      slug: slugify(block.children.map((span: any) => span.text).join('')),
    }));
};

type Props = {
  children: React.ReactNode;
  params: { slug: string[] };
};

export default async function DocsLayout({ children, params }: Props) {
  const categorySlug = params.slug?.[0];
  const articleSlug = params.slug?.[1];

  if (!categorySlug) {
    return <div>Cannot determine category.</div>;
  }

  // Fetch navigation and article data in parallel
  const [category, article] = await Promise.all([
    getCategoryWithArticles(categorySlug),
    articleSlug ? getArticle(articleSlug) : Promise.resolve(null),
  ]);

  if (!category) {
    notFound();
  }

  const headings = article ? extractHeadings(article.content) : [];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      aside={{ width: 250, breakpoint: 'md', collapsed: headings.length === 0 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Title order={3}>Qirvo Docs</Title>
          </Link>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={4} mb="md">{category.title}</Title>
        <ScrollArea type="auto" style={{ flex: 1 }}>
          {category.articles.map((article) => (
            <NavLink
              key={article._id}
              href={`/docs/${categorySlug}/${article.slug}`}
              label={article.title}
              component={Link}
              active={article.slug === articleSlug}
              className={classes.navLink}
            />
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Aside p="md">
        <TableOfContents headings={headings} />
      </AppShell.Aside>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
