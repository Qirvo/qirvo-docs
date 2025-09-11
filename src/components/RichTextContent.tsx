'use client';

import { PortableText, PortableTextComponents } from '@portabletext/react';
import { Title, Text, Alert, Code, Paper } from '@mantine/core';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IconInfoCircle, IconAlertTriangle, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import urlBuilder from '@sanity/image-url';
import { client } from '@/sanity/client';
import Image from 'next/image';

// Helper to slugify strings for IDs
const slugify = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const calloutIcons: Record<string, React.ReactNode> = {
  info: <IconInfoCircle />,
  warning: <IconAlertTriangle />,
  success: <IconCircleCheck />,
  danger: <IconAlertCircle />,
};

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <Title order={1} my="lg">{children}</Title>,
    h2: ({ children }) => <Title order={2} my="lg" id={slugify(children?.toString() || '')}>{children}</Title>,
    h3: ({ children }) => <Title order={3} my="md" id={slugify(children?.toString() || '')}>{children}</Title>,
    h4: ({ children }) => <Title order={4} my="sm" id={slugify(children?.toString() || '')}>{children}</Title>,
    blockquote: ({ children }) => <Text component="blockquote" my="md" pl="md" style={{ borderLeft: '3px solid var(--mantine-color-gray-5)' }}>{children}</Text>,
    normal: ({ children }) => <Text my="md">{children}</Text>,
  },
  types: {
    callout: ({ value }) => (
      <Alert
        variant="light"
        color={value.style || 'info'}
        title={value.style.charAt(0).toUpperCase() + value.style.slice(1)}
        icon={calloutIcons[value.style]}
        my="lg"
      >
        <PortableText value={value.content} components={components} />
      </Alert>
    ),
    codeBlock: ({ value }) => (
      <SyntaxHighlighter language={value.language || 'text'} style={coldarkDark} customStyle={{ borderRadius: 'var(--mantine-radius-md)', margin: '1.5rem 0' }}>
        {value.code}
      </SyntaxHighlighter>
    ),
    image: ({ value }) => {
        const imageUrl = urlBuilder(client).image(value).width(800).auto('format').url();
        return <Image src={imageUrl} alt={value.alt || ''} width={800} height={400} style={{maxWidth: '100%', height: 'auto', margin: '1rem 0'}}/>
    }
  },
  marks: {
    code: ({ children }) => <Code>{children}</Code>,
  },
};

export function RichTextContent({ content }: { content: any }) {
  return <PortableText value={content} components={components} />;
}
