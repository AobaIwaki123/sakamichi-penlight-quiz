"use client";

import { Card, Container, Image, Skeleton } from "@mantine/core";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";

export function MemberImage() {
  const selectedMember = useSelectedMemberStore(
    (state) => state.selectedMember
  );
  const isLoading = useSelectedMemberStore((state) => state.isLoading);

  return (
    <Container size="60%">
      <Card radius="md">
        <Card.Section style={{ height: 220, overflow: "hidden" }}>
          {isLoading || !selectedMember ? (
            <Skeleton height={220} radius="md" width="100%" />
          ) : (
            <Image
              fit="cover"
              height={220}
              src={selectedMember.url}
              width="100%" // アスペクト比を無視して埋める
            />
          )}
        </Card.Section>
      </Card>
    </Container>
  );
}
