import { ActionIcon, Container, Group } from '@mantine/core';
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';
import { GitHubIcon } from '../GitHubIcon/GitHubIcon';
import classes from './FooterSocial.module.css';

export function FooterSocial() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <GitHubIcon />
        </Group>
      </Container>
    </div>
  );
}
