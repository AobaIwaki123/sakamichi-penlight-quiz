import { Container, Group, Text } from '@mantine/core';
import { GitHubIcon } from '../GitHubIcon/GitHubIcon';
import { getAppVersion } from '@/lib/getVersion';

import classes from './FooterSocial.module.css';

export function FooterSocial() {
  const version = getAppVersion();

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <GitHubIcon />
          <Text ta="center" mt="xs" mb="xs" size="md" c="dimmed">
            AobaIwaki123 All Rights Reserved
          </Text>
        </Group>
          <Text ta="center" mt="xs" mb="xs" size="md" c="dimmed">
            v{version}
          </Text>
      </Container>
    </div>
  );
}
