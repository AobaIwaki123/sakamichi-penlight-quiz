import { Container, Grid, Group } from "@mantine/core";
import { Penlight } from "./Penlight/Penlight";

export function PenlightForm() {
  return (
    <Grid>
      <Grid.Col span={{ base: 6 }}>
        <Penlight />
      </Grid.Col>
      <Grid.Col span={{ base: 6 }}>
        <Penlight />
      </Grid.Col>
    </Grid>
  )
}
