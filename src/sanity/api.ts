import { client } from './client';
import { allCategoriesQuery, categoryWithArticlesQuery, articleQuery, articleSearchQuery } from './queries';

// Define types for our data
export interface Category {
  _id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
}

export interface ArticleStub {
  _id: string;
  title: string;
  slug: string;
}

export interface CategoryWithArticles {
  title: string;
  articles: ArticleStub[];
}

export interface Article extends ArticleStub {
  content: any; // Portable Text
  excerpt: string;
  category: {
    title: string;
    slug: string;
  };
}

export interface SearchResult extends ArticleStub {
  excerpt: string;
  category: {
    title: string;
    slug: string;
  };
}


export async function getAllCategories(): Promise<Category[]> {
  return client.fetch(allCategoriesQuery);
}

export async function getCategoryWithArticles(slug: string): Promise<CategoryWithArticles> {
  return client.fetch(categoryWithArticlesQuery, { slug });
}

export async function getArticle(slug:string): Promise<Article> {
  return client.fetch(articleQuery, { slug });
}

export async function searchArticles(term: string): Promise<SearchResult[]> {
  return client.fetch(articleSearchQuery, { term: `*${term}*` });
}
