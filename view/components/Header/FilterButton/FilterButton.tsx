"use client";

import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconFilter, IconFilterFilled } from '@tabler/icons-react';
import { useState } from "react";

export function FilterButton() {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <Group justify="center">
      <ActionIcon
        onClick={() => setIsPressed((prev) => !prev)}
        variant="subtle"
        size="xl"
      >
        {isPressed ? (
          <IconFilter stroke={1.5} />) : (
          <IconFilterFilled stroke={1.5} />
        )
        }
      </ActionIcon>
    </Group>
  );
}
