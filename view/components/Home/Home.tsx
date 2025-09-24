"use client";
import { Container, Grid } from "@mantine/core";
import { InitialLoader } from "@/components/Helper/ModeIconWrapper/initialMemberLoader";
import { Notification } from "@/components/Notification/Notification";
import { MemberInfo } from "./MemberInfo/MemberInfo";
import { PenlightForm } from "./PenlightForm/PenlightForm";

export default function Home() {
  return (
    <Container>
      <InitialLoader />
      <Notification />
      <Grid>
        <Grid.Col span={{ base: 12, xs: 6 }} style={{ minHeight: 300 }}>
          <MemberInfo />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6 }}>
          <PenlightForm />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
