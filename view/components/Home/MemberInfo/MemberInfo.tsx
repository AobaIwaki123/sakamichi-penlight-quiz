"use client";

import { useAnswerCloseTriggerStore } from '@/stores/useAnswerCloseTriggerStore'
import { useFilterStore } from '@/stores/useFilterStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';
import type { Member } from "@/types/Member";

import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";

import { useEffect } from "react";

export function MemberInfo() {
  const checkedFilters = useFilterStore((state) => state.checkedFilters);

  const triggerCount = useAnswerCloseTriggerStore((state) => state.triggerCount);

  const pickRandomMember = useSelectedMemberStore((state) => state.pickRandomMember) as () => Member | undefined;

  useEffect(() => {
    const _ = triggerCount;
    const selected = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([type]) => type);

    // フィルターが選択されている場合、または初期状態（フィルターが未設定）の場合にメンバーを選択
    if (selected.length > 0 || Object.keys(checkedFilters).length === 0) {
      const random = pickRandomMember()

      // if (random === undefined) {
      //   alert("メンバーが選ばれませんでした。フィルターを確認してください。");
      //   return;
      // }
      console.log("選ばれたメンバー:", random);
    }
  }, [triggerCount, checkedFilters, pickRandomMember]);

  return (
    <>
      <MemberInfoHeader />
      <MemberImage />
    </>
  );
}
