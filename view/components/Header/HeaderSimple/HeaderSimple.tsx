"use client";

import { Container, Group } from '@mantine/core';
import { FilterButton } from '../FilterButton/FilterButton';
import { LightDarkToggle } from '../LightDarkToggle/LightDarkToggle';
import { SakamichiPenlightQuizIcon } from '../SakamichiPenlightQuizIcon/SakamichiPenlightQuizIcon';
import classes from './HeaderSimple.module.css';

export function HeaderSimple() {
  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <SakamichiPenlightQuizIcon />

        <Group>
          <FilterButton />
          <LightDarkToggle />
        </Group>
      </Container>
    </header>
  );
}
