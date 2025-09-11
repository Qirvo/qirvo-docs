import { getAllCategories, Category } from '@/sanity/api';
import { Card, Container, SimpleGrid, Text, Title, Group } from '@mantine/core';
import Link from 'next/link';
import * as MdIcons from 'react-icons/md';
import classes from './homepage.module.css';
import { Search } from '@/components/Search';

// Helper to dynamically render icons
function DynamicIcon({ name }: { name: string }) {
  const IconComponent = (MdIcons as any)[name];

  if (!IconComponent) {
    // Return a default icon if the specified one isn't found
    return <MdIcons.MdHelpOutline size="2.5rem" />;
  }

  return <IconComponent size="2.5rem" />;
}

export default async function Home() {
  const categories = await getAllCategories();

  return (
    <Container size="lg" py="xl">
      <Title order={1} className={classes.title} ta="center" mt="sm">
        Documentation
      </Title>
      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Your one-stop destination for guides, API references, and tutorials.
      </Text>

      <div className={classes.search}>
        <Search />
      </div>

      {categories.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="xl">
          {categories.map((category: Category) => (
            <Card
              key={category._id}
              shadow="md"
              radius="md"
              component={Link}
              href={`/docs/${category.slug}`}
              className={classes.card}
              padding="xl"
            >
              <Group>
                <div className={classes.iconWrapper}>
                  <DynamicIcon name={category.icon} />
                </div>
                <div>
                  <Text fw={700} size="lg" className={classes.cardTitle}>
                    {category.title}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    {category.description}
                  </Text>
                </div>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text ta="center" mt="xl">
          No documentation categories have been created yet.
        </Text>
      )}
    </Container>
  );
}
