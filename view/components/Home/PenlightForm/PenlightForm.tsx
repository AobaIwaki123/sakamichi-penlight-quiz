import { Container, Group } from "@mantine/core";
import { Penlight } from "./Penlight/Penlight";

export function PenlightForm() {
  return (
    <Group justify="center" align="center" gap="xl" grow="1">
      <Penlight />
      <Penlight />
    </Group>
  )
}
