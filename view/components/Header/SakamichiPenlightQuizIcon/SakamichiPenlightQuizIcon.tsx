import { Box, Text } from "@mantine/core";
import { SakamichiLogo } from "../SakamichiLogo/SakamichiLogo";

import classes from "./SakamichiPenlightQuizIcon.module.css";

export function SakamichiPenlightQuizIcon() {
  return (
    <Box style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <SakamichiLogo />
      <Text
        className={classes.name}
        gradient={{ from: "violet", to: "blue" }}
        style={{ marginLeft: 0 }}
        variant="gradient"
      >
        ペンライトクイズ
      </Text>
    </Box>
  );
}
