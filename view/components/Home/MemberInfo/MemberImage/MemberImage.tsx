"use client";

import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { Card, Container, Image, Skeleton } from '@mantine/core';


export function MemberImage() {
  const selectedMember = useSelectedMemberStore((state) => state.selectedMember);

  return (
    <Container size="60%">
      <Card radius="md" >
        <Card.Section>
          {selectedMember ? (
            <Image src={selectedMember.image} />
          ) : (
            <Skeleton height={240} width="100%" radius="md" />
          )}
        </Card.Section>
      </Card>
    </Container>
  );
}
