"use client";

import { HinatazakaMembers } from "@/consts/hinatazakaMembers";
import { useAnswerTriggerStore } from '@/stores/useAnswerTriggerStore'
import { useFilterStore } from '@/stores/useFilterStore';
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore';

import { MemberImage } from "./MemberImage/MemberImage";
import { MemberInfoHeader } from "./MemberInfoHeader/MemberInfoHeader";

import { useEffect } from "react";

export function MemberInfo() {
  const checkedFilters = useFilterStore((state) => state.checkedFilters);

  const triggerCount = useAnswerTriggerStore((state) => state.triggerCount);

  const setSelectedMember = useSelectedMemberStore((state) => state.setSelectedMember);

  useEffect(() => {
    const _ = triggerCount;
    const selected = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([type]) => type);

    if (selected.length > 0) {
      const random = HinatazakaMembers[Math.floor(Math.random() * HinatazakaMembers.length)];
      setSelectedMember(random);
      console.log("選ばれたメンバー:", random);
    }
  }, [triggerCount, checkedFilters, setSelectedMember]);

  return (
    <>
      <MemberInfoHeader/>
      <MemberImage/>
    </>
  );
}
