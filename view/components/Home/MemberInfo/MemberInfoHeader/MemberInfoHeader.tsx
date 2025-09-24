"use client";

import { Container, Group, Skeleton, Text } from "@mantine/core";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";
import classes from "./MemberInfoHeader.module.css";

export type MemberInfoHeaderProps = {
  name: string;
  emoji: string;
};

export function MemberInfoHeader() {
  const selectedMember = useSelectedMemberStore(
    (state) => state.selectedMember
  );
  const isLoading = useSelectedMemberStore((state) => state.isLoading);

  return (
    <Container className={classes.header} size="100%">
      <Group justify="center">
        <Group className={classes.name} justify="center">
          {isLoading || !selectedMember ? (
            <Skeleton height={30} radius="xl" width={200} />
          ) : (
            <>
              <Text inherit>{selectedMember.emoji}</Text>
              <Text
                component="span"
                gradient={{ from: "pink", to: "yellow" }}
                inherit
                variant="gradient"
              >
                {selectedMember.name}
              </Text>
            </>
          )}
        </Group>
      </Group>
    </Container>
  );
}
