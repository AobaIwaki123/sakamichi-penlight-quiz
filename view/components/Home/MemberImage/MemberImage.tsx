"use client";

import { Card, Container, Image, SimpleGrid, Skeleton } from '@mantine/core';

const child = <Skeleton height={140} radius="md" animate={false} />;

export function MemberImage() {
  return (
    <Container size="70%">
      <Card radius="md" >
        <Card.Section>
          <Image src="https://cdn.hinatazaka46.com/images/14/fa2/dbc520dc2a261472c591987a0a3ae/1000_1000_102400.jpg" />
        </Card.Section>
      </Card>
    </Container>
  );
}
