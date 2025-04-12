"use client";

import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import type { Group } from '@/stores/useSelectedMemberStore';
import { useEffect } from 'react'

export const InitialLoader = () => {
  const selectedGroup = useSelectedMemberStore((s: { selectedGroup: Group }) => s.selectedGroup)
  const setGroup = useSelectedMemberStore((s: { setGroup: (group: Group) => void }) => s.setGroup)

  useEffect(() => {
    setGroup(selectedGroup) // 初回マウント時にロード
  }, [setGroup, selectedGroup])

  return null
}
