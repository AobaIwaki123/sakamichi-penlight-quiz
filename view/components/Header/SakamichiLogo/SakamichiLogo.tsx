import { ActionIcon } from "@mantine/core"
import { useLogoStore } from "@/stores/useLogoStore"
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore"

export function SakamichiLogo() {
  const setGroup = useSelectedMemberStore((state) => state.setGroup);
  const currentLogo = useLogoStore((state) => state.current)

  const onClick = () => {
    console.log("nextLogo", currentLogo.name)
    const nextLogo = useLogoStore.getState().next()
    console.log("nextLogo", currentLogo.name)
    console.log("nextLogo", nextLogo.name)
    setGroup(nextLogo.name)
  }
  
  return (
    <>
      <ActionIcon variant="light" size="xl" onClick={onClick}>
        <img
          src={currentLogo.url}
          alt={currentLogo.name}
          style={{ width: '100%', height: '100%' }}
        />
      </ActionIcon>
    </>
  )
}
