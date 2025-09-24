import { Container, Group, Text } from "@mantine/core";
import { getAppVersion } from "@/lib/getVersion";
import { GitHubIcon } from "../GitHubIcon/GitHubIcon";

import classes from "./FooterSocial.module.css";

export function FooterSocial() {
  const version = getAppVersion();

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group
          className={classes.links}
          gap={0}
          justify="flex-end"
          wrap="nowrap"
        >
          <GitHubIcon />
          <Text c="dimmed" mb="xs" mt="xs" size="md" ta="center">
            AobaIwaki123 All Rights Reserved
          </Text>
        </Group>
        <Text c="dimmed" mb="xs" mt="xs" size="md" ta="center">
          v{version}
        </Text>
      </Container>
    </div>
  );
}
