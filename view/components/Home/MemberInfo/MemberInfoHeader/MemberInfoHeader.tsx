"use client";

import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Container, Group, Text, Skeleton } from '@mantine/core';
import classes from './MemberInfoHeader.module.css';

export type MemberInfoHeaderProps = {
  name: string;
  emoji: string;
}


export function MemberInfoHeader() {
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);
  const isLoading = useSelectedMemberStore((state) => state.isLoading);

  return (
    <Container className={classes.header} size="100%">
      <Group justify="center">
        <Group justify="center" className={classes.name}>
          {isLoading || !selectedMember ? (
            <Skeleton height={30} width={200} radius="xl" />
          ) : (
            <>
              <Text inherit>{selectedMember.emoji}</Text>
              <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
                {selectedMember.name}
              </Text>
            </>
          )}
        </Group>
      </Group>
    </Container>
  );
}
