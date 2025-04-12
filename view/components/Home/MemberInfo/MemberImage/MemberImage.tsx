"use client";

import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Card, Container, Image, Skeleton } from '@mantine/core';

export function MemberImage() {
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);

  return (
    <Container size="60%">
      <Card radius="md">
        <Card.Section style={{ height: 240, overflow: 'hidden' }}>
          {selectedMember ? (
            <Image
              src={selectedMember.url}
              height={240}
              width="100%"
              fit="cover" // アスペクト比を無視して埋める
            />
          ) : (
            <Skeleton height={240} width="100%" radius="md" />
          )}
        </Card.Section>
      </Card>
    </Container>
  );
}
