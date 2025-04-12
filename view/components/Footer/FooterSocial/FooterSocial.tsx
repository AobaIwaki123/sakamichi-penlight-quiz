import { Container, Group, Text } from '@mantine/core';
import { GitHubIcon } from '../GitHubIcon/GitHubIcon';
import classes from './FooterSocial.module.css';

export function FooterSocial() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <GitHubIcon />
          <Text ta="center" mt="xs" mb="xs" size="md" c="dimmed">
            AobaIwaki123 All Rights Reserved
          </Text>
        </Group>
      </Container>
    </div>
  );
}
