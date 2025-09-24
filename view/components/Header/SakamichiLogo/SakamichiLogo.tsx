import { ActionIcon } from "@mantine/core";
import { useLogoStore } from "@/stores/useLogoStore";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";

export function SakamichiLogo() {
  const setGroup = useSelectedMemberStore((state) => state.setGroup);
  const currentLogo = useLogoStore((state) => state.current);

  const onClick = () => {
    const nextLogo = useLogoStore.getState().next();
    console.log("nextLogo", nextLogo.name);
    setGroup(nextLogo.name);
  };

  return (
    <>
      <ActionIcon onClick={onClick} size="xl" variant="light">
        <img
          alt={currentLogo.name}
          src={currentLogo.url}
          style={{ width: "100%", height: "100%" }}
        />
      </ActionIcon>
    </>
  );
}
