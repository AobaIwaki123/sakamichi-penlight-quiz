import { ActionIcon, Anchor } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export function GitHubIcon() {
  return (
    <Anchor href="https://github.com/AobaIwaki123/sakamichi-penlight-quiz" target="_blank">
      <ActionIcon variant="subtle" size="lg">
        <IconBrandGithub stroke={1.5} />
      </ActionIcon>
    </Anchor>
  )
}
