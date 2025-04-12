import { ActionIcon } from "@mantine/core"
import { useLogoStore } from "@/stores/useLogoStore"

import { useState } from "react"

export function SakamichiLogo() {
  const [group, setGroup] = useState('hinatazaka') // This should be dynamic based on the selected group
  const currentLogo = useLogoStore((state) => state.current)

  const onClick = () => {
    setGroup(currentLogo.name)
    useLogoStore.getState().next()
  }
  
  return (
    <>
      <ActionIcon variant="light" size="xl" onClick={onClick}>
        <img
          src={currentLogo.url}
          alt={group}
          style={{ width: '100%', height: '100%' }}
        />
      </ActionIcon>
    </>
  )
}
