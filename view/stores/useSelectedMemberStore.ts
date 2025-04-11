import type { Member } from "@/consts/hinatazakaMembers";
// stores/useSelectedMemberStore.ts
import { create } from "zustand";

type SelectedMemberState = {
  selectedMember: Member | null;
  setSelectedMember: (member: Member | null) => void;
};

export const useSelectedMemberStore = create<SelectedMemberState>((set) => ({
  selectedMember: null,
  setSelectedMember: (member) => set({ selectedMember: member }),
}));
