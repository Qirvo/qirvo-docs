'use server';

import { searchArticles } from '@/sanity/api';

export async function searchDocsAction(term: string) {
  if (!term) {
    return [];
  }
  const results = await searchArticles(term);
  return results;
}
