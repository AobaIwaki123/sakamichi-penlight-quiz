"use client";

import { Button } from "@mantine/core";

export function CurlButton() {
  const onClick = () => {
    console.log("curl");
  };

  return (
    <Button
      onClick={onClick}
      radius="xl"
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      Curl
    </Button>
  );
}
