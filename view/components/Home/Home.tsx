"use client";

import { InitialLoader } from '@/components/Helper/ModeIconWrapper/initialMemberLoader';
import { Container, Grid } from '@mantine/core';
import { MemberInfo } from "./MemberInfo/MemberInfo";
import { PenlightForm } from "./PenlightForm/PenlightForm";
import { Notification } from '@/components/Notification/Notification';

export default function Home() {
  InitialLoader();

  return (
    <Container>
      <Notification />
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
