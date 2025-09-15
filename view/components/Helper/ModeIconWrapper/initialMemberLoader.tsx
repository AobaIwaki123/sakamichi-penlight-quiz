"use client";

import { useEffect } from 'react';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { hinatazakaFilters } from '@/consts/hinatazakaFilters';

export const InitialLoader = () => {
  const selectedGroup = useSelectedMemberStore((state) => state.selectedGroup);
  const allMembers = useSelectedMemberStore((state) => state.allMembers);
  const setGroup = useSelectedMemberStore((state) => state.setGroup);

  useEffect(() => {
    // フィルターの初期化を先に実行
    for (const filter of hinatazakaFilters) {
      useFilterStore.getState().setFilter(filter.type, filter.defaultChecked || false);
    }

    if (allMembers.length === 0) {
      // 初回のみデータロード
      setGroup(selectedGroup);
    }
  }, [allMembers.length, selectedGroup, setGroup]);

  return null;
};
