'use client';

import { Box, NavLink, Title } from '@mantine/core';
import Link from 'next/link';

export interface TocHeading {
  text: string;
  level: number;
  slug: string;
}

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <Box component="nav">
      <Title order={5} mb="sm">On this page</Title>
      {headings.map((heading) => (
        <NavLink
          key={heading.slug}
          href={`#${heading.slug}`}
          label={heading.text}
          component="a" // Use 'a' tag for anchor links
          style={{ paddingLeft: `calc(${heading.level - 1} * var(--mantine-spacing-md))` }}
        />
      ))}
    </Box>
  );
}
