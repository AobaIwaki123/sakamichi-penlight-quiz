import { HinatazakaMembers } from "@/consts/hinatazakaMembers";
import type { Member } from "@/consts/hinatazakaMembers";
import { useFilterStore } from '@/stores/useFilterStore';
import { MemberImage } from "../MemberImage/MemberImage";
import { MemberInfoHeader } from "../MemberInfoHeader/MemberInfoHeader";

import { useEffect, useState } from "react";

export function MemberInfo() {
  const checkedFilters = useFilterStore((state) => state.checkedFilters);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    const selected = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([type]) => type);

    if (selected.length > 0) {
      const random = HinatazakaMembers[Math.floor(Math.random() * HinatazakaMembers.length)];
      setSelectedMember(random);
      console.log("選ばれたメンバー:", random);
    }
  }, [checkedFilters]);

  if (!selectedMember) {
    return null; // or a loading state
  }

  return (
    <>
      <MemberInfoHeader name={selectedMember.name} emoji={selectedMember.emoji} />
      <MemberImage image={selectedMember.image}/>
    </>
  );
}
