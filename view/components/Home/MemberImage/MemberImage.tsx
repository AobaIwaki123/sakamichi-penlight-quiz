"use client";

import { Card, Container, Image } from '@mantine/core';

export function MemberImage() {
  return (
    <Container size="60%">
      <Card radius="md" >
        <Card.Section>
          <Image src="https://cdn.hinatazaka46.com/images/14/fa2/dbc520dc2a261472c591987a0a3ae/800_800_102400.jpg" />
        </Card.Section>
      </Card>
    </Container>
  );
}
