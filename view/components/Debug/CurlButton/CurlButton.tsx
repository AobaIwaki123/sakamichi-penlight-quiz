"use client";

import { Button } from "@mantine/core";

import { queryBigQuery } from "@/api/bq/get_hinatazaka_member";

export function CurlButton() {
  const onClick = async () => {
    const res = await queryBigQuery();
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
