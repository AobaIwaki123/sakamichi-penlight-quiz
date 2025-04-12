"use client";

import { Container, Group } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import { FilterButton } from '../FilterButton/FilterButton';
import { LightDarkToggle } from '../LightDarkToggle/LightDarkToggle';
import { SakamichiLogo } from '../SakamichiLogo/SakamichiLogo';
import { SakamichiPenlightQuizIcon } from '../SakamichiPenlightQuizIcon/SakamichiPenlightQuizIcon';
import classes from './HeaderSimple.module.css';

export function HeaderSimple() {
  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <SakamichiPenlightQuizIcon />

        <Group>
          <SakamichiLogo />
          <FilterButton />
          <LightDarkToggle />
        </Group>
      </Container>
    </header>
  );
}
