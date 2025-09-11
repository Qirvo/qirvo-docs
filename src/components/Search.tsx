'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Loader, Stack, Group, Text, NavLink } from '@mantine/core';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { searchDocsAction } from '@/app/actions';
import { SearchResult } from '@/sanity/api';
import Link from 'next/link';

export function Search() {
  const [opened, { open, close }] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery) {
        setLoading(true);
        const searchResults = await searchDocsAction(debouncedQuery);
        setResults(searchResults);
        setLoading(false);
      } else {
        setResults([]);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  return (
    <>
      <TextInput
        placeholder="Search documentation..."
        size="lg"
        leftSection={<IconSearch size={18} />}
        radius="md"
        onClick={open}
        readOnly
        style={{ cursor: 'pointer' }}
      />

      <Modal opened={opened} onClose={close} title="Search Documentation" size="lg">
        <TextInput
          placeholder="Search for articles, guides, and more..."
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          autoFocus
        />
        <Stack mt="md">
          {loading && <Loader />}
          {!loading && results.length === 0 && debouncedQuery && (
            <Text>No results found for "{debouncedQuery}"</Text>
          )}
          {results.map((result) => (
            <NavLink
              key={result._id}
              component={Link}
              href={`/docs/${result.category.slug}/${result.slug}`}
              onClick={close}
              label={result.title}
              description={result.excerpt}
            />
          ))}
        </Stack>
      </Modal>
    </>
  );
}
