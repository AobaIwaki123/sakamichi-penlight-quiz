"use client";

import { ActionIcon, AspectRatio, Box, Card, Text } from "@mantine/core";
import { IconCaretLeft, IconCaretRight } from "@tabler/icons-react";
import { useColorController } from "@/hooks/useColorController";
import classes from "./Penlight.module.css";

export function Penlight({ id }: { id: string }) {
  const { color, nameJa, next, prev } = useColorController(id);

  return (
    <Card className={classes.base}>
      <Card.Section className={classes.penlight}>
        <AspectRatio ratio={100 / 270}>
          <Box bg={color} className={classes.penlight_box} w={50} />
        </AspectRatio>
      </Card.Section>
      <Text c="dimmed" fw={700} mb="xs" mt="xs" size="md" ta="center">
        {nameJa}
      </Text>

      <Card.Section className={classes.button}>
        <ActionIcon
          className={classes.icon}
          color="blue"
          onClick={prev}
          size="xl"
          variant="light"
        >
          <IconCaretLeft size={35} />
        </ActionIcon>
        <ActionIcon
          className={classes.icon}
          color="blue"
          onClick={next}
          size="xl"
          variant="light"
        >
          <IconCaretRight size={35} />
        </ActionIcon>
      </Card.Section>
    </Card>
  );
}
