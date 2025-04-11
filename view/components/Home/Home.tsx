"use client";

import { Container, Grid, Overlay } from '@mantine/core';
import { MemberInfo } from "./MemberInfo/MemberInfo";
import { PenlightForm } from "./PenlightForm/PenlightForm";

export default function Home() {
  return (
    <Container>
      <Grid>
        <Grid.Col span={{ base: 12, xs: 6 }} style={{ minHeight: 315 }}>
          <MemberInfo />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <PenlightForm />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
