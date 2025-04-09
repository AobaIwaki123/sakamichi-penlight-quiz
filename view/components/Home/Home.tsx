"use client";

import { Container, Grid } from '@mantine/core';
import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";

export default function Home() {
  return (
    <Container>
      <Grid>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <MemberInfoHeader />
          <MemberImage />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
