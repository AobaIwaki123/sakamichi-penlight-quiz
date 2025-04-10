"use client";

import { Container, Group, Text } from '@mantine/core';
import classes from './MemberInfoHeader.module.css';

export type MemberInfoHeaderProps = {
  name: string;
  emoji: string;
}

export function MemberInfoHeader({ name , emoji　}: MemberInfoHeaderProps) {
  return (
    <Container className={classes.header} size="100%">
      <Group justify="center">
        <Group justify="center" className={classes.name}>
          <Text inherit>
            {emoji}
          </Text>
          <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
            {name}
          </Text>
          <Text inherit/>
        </Group>
      </Group>
    </Container >
  );
}
