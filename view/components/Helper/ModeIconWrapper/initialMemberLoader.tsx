"use client";

import { useEffect } from 'react';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';

export const InitialLoader = () => {
  const selectedGroup = useSelectedMemberStore((state) => state.selectedGroup);
  const allMembers = useSelectedMemberStore((state) => state.allMembers);
  const setGroup = useSelectedMemberStore((state) => state.setGroup);

  useEffect(() => {
    if (allMembers.length === 0) {
      // 初回のみデータロード
      setGroup(selectedGroup);
    }
  }, [allMembers.length, selectedGroup, setGroup]);

  return null;
};
