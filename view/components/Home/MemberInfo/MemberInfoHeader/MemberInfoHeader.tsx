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

  return (
    <Container className={classes.header} size="100%">
      <Group justify="center">
        <Group justify="center" className={classes.name}>
          {selectedMember ? (
            <>
              <Text inherit>{selectedMember.emoji}</Text>
              <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
                {selectedMember.name}
              </Text>
            </>
          ) : (
            <Skeleton height={30} width={200} radius="xl" />
          )}
        </Group>
      </Group>
    </Container>
  );
}
