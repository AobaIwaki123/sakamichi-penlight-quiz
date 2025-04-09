"use client";

import { Container, Group, Text } from '@mantine/core';
import classes from './MemberInfoHeader.module.css';

export function MemberInfoHeader() {
  return (
    <Container className={classes.header} size="70%">
      <Text className={classes.name}>
        <Group>
          <Text inherit>
            🦥️
          </Text>
          <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
            宮地すみれ
          </Text>
        </Group>
      </Text>
    </Container >
  );
}
