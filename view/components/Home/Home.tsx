"use client";

import { Container, Grid } from '@mantine/core';
import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";
import { PenlightForm } from "./PenlightForm/PenlightForm";
import { MemberInfo } from "./MemberInfo/MemberInfo";

export default function Home() {
  return (
    <Container>
      <Grid>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <MemberInfo />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <PenlightForm />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
