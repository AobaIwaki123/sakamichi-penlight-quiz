import { Center, Grid } from "@mantine/core";
import { AnswerButton } from "./AnswerButton/AnswerButton";
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
      <Grid.Col span={{ base: 12 }}>
        <Center>
          <AnswerButton />
        </Center>
      </Grid.Col>
    </Grid>
  )
}
