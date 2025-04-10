"use client";

import { Container, Grid } from '@mantine/core';
import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";
import { PenlightForm } from "./PenlightForm/PenlightForm";

export default function Home() {
  return (
    <Container>
      <Grid>
        <Grid.Col span={{ base: 12, xs: 6 }} key="aa">
          <MemberInfoHeader />
          <MemberImage />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <PenlightForm />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
