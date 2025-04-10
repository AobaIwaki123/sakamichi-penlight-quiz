"use client";

import { useColorController } from '@/hooks/useColorController';
import { ActionIcon, AspectRatio, Box, Card, Text } from '@mantine/core';
import { IconCaretLeft, IconCaretRight } from '@tabler/icons-react';
import classes from './Penlight.module.css';

export function Penlight() {
  const { color, key, next, prev } = useColorController();

  return (
    <Card className={classes.base}>
      <Card.Section className={classes.penlight}>
        <AspectRatio ratio={100 / 270}>
          <Box bg={color} w={50} className={classes.penlight_box} />
        </AspectRatio>
        <Text ta="center" mt="xs" mb="xs" size="md" c="dimmed">{key}</Text>
      </Card.Section>

      <Card.Section className={classes.button}>
        <ActionIcon variant="light" color="blue" size="xl" className={classes.icon} onClick={prev}>
          <IconCaretLeft size={35} />
        </ActionIcon>
        <ActionIcon variant="light" color="blue" size="xl" className={classes.icon} onClick={next}>
          <IconCaretRight size={35} />
        </ActionIcon>
      </Card.Section>
    </Card>
  );
}
