"use client";

import { useEffect } from "react";
import { useAnswerCloseTriggerStore } from "@/stores/useAnswerCloseTriggerStore";
import { useFilterStore } from "@/stores/useFilterStore";
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";
import type { Member } from "@/types/Member";
import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";

export function MemberInfo() {
  const checkedFilters = useFilterStore((state) => state.checkedFilters);

  const triggerCount = useAnswerCloseTriggerStore(
    (state) => state.triggerCount
  );

  const pickRandomMember = useSelectedMemberStore(
    (state) => state.pickRandomMember
  ) as () => Member | undefined;

  useEffect(() => {
    const _ = triggerCount;
    const selected = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([type]) => type);

    if (selected.length > 0) {
      const random = pickRandomMember();

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
