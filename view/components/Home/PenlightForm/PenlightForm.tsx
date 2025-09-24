import { Center, Grid } from "@mantine/core";
import { AnswerButton } from "./AnswerButton/AnswerButton";
import { Penlight } from "./Penlight/Penlight";

export function PenlightForm() {
  return (
    <Grid>
      <Grid.Col span={{ base: 6 }}>
        <Penlight id="left" />
      </Grid.Col>
      <Grid.Col span={{ base: 6 }}>
        <Penlight id="right" />
      </Grid.Col>
      <Grid.Col span={{ base: 12 }}>
        <Center>
          <AnswerButton />
        </Center>
      </Grid.Col>
    </Grid>
  );
}
