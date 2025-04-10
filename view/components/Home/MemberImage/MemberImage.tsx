"use client";

import { Card, Container, Image } from '@mantine/core';

export type MemberImageProps = {
  image: string;
}

export function MemberImage({ image }: MemberImageProps) {
  return (
    <Container size="60%">
      <Card radius="md" >
        <Card.Section>
          <Image src={image} />
        </Card.Section>
      </Card>
    </Container>
  );
}
