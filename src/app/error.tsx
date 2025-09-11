'use client';

import { Title, Text, Button, Container, Group } from '@mantine/core';
import classes from './error.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>500</div>
        <Title className={classes.title}>Something bad just happened...</Title>
        <Text size="lg" ta="center" className={classes.description}>
          Our servers could not handle your request. Don't worry, our development team was already
          notified. Try to refresh the page.
        </Text>
        <Group justify="center">
          <Button variant="white" size="md" onClick={() => reset()}>
            Refresh the page
          </Button>
        </Group>
      </Container>
    </div>
  );
}
