
import { Button, Container, Group, Text, Title } from '@mantine/core';
import classes from './ServerError500.module.css';

export function ServerError500() {
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>500</div>
        <Title className={classes.title}>Something bad just happened...</Title>
        <Text size="lg" ta="center" className={classes.description}>
          Our servers could not handle your request. Don&apos;t worry, our development team was
          already notified. Try refreshing the page.
        </Text>
        <Group justify="center">
          <Button variant="white" size="md" onClick={
            () => {
              window.location.reload();
            }
          }>
            Refresh the page
          </Button>
        </Group>
      </Container>
    </div>
  );
}
