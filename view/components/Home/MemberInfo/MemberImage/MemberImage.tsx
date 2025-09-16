"use client";

import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Card, Container, Image, Skeleton } from '@mantine/core';

export function MemberImage() {
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);
  const isLoading = useSelectedMemberStore((state) => state.isLoading);

  return (
    <Container size="60%">
      <Card radius="md">
        <Card.Section style={{ height: 220, overflow: 'hidden' }}>
          {isLoading || !selectedMember ? (
            <Skeleton height={220} width="100%" radius="md" />
          ) : (
            <Image
              src={selectedMember.url}
              height={220}
              width="100%"
              fit="cover" // アスペクト比を無視して埋める
            />
          )}
        </Card.Section>
      </Card>
    </Container>
  );
}
