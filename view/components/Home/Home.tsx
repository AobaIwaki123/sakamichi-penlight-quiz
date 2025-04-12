"use client";

import { InitialLoader } from '@/components/Helper/ModeIconWrapper/initialMemberLoader';
import { Container, Grid, Overlay } from '@mantine/core';
import { useEffect } from 'react';
import { MemberInfo } from "./MemberInfo/MemberInfo";
import { PenlightForm } from "./PenlightForm/PenlightForm";

export default function Home() {
  InitialLoader();

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
