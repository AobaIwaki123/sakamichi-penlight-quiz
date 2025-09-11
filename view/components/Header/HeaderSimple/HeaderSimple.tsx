"use client";

import { Container, Group, ActionIcon } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '../FilterButton/FilterButton';
import { LightDarkToggle } from '../LightDarkToggle/LightDarkToggle';
import { SakamichiPenlightQuizIcon } from '../SakamichiPenlightQuizIcon/SakamichiPenlightQuizIcon';
import classes from './HeaderSimple.module.css';

export function HeaderSimple() {
  const router = useRouter();

  /**
   * アカウント設定ページに遷移する
   */
  const handleAccountSettings = () => {
    router.push('/account');
  };

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <SakamichiPenlightQuizIcon />

        <Group>
          <FilterButton />
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={handleAccountSettings}
            title="アカウント設定"
          >
            <IconSettings size={20} />
          </ActionIcon>
          <LightDarkToggle />
        </Group>
      </Container>
    </header>
  );
}
