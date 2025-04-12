import type { Generation } from "@/consts/hinatazakaFilters";
import type { Member } from '@/consts/hinatazakaMembers';
import { HinatazakaMembers } from '@/consts/hinatazakaMembers'
import { create } from 'zustand'

export type Group = 'nogizaka' | 'sakurazaka' | 'hinatazaka'

type State = {
  selectedGroup: Group
  allMembers: Member[]
  filters: {
  gen?: Generation[] // ← 単一ではなく複数
  graduated?: boolean
} // フィルタ可能な属性を絞る
  filteredMembers: Member[]
  selectedMember?: Member
  isLoading: boolean
  setGroup: (group: Group) => void
  setFilters: (filters: {
  gen?: Generation[] // ← 単一ではなく複数
  graduated?: boolean
}) => void
  applyFilters: () => void
  pickRandomMember: () => void
}

export const useSelectedMemberStore = create<State>((set, get) => ({
  selectedGroup: 'hinatazaka',
  allMembers: [],
  filters: {},
  filteredMembers: [],
  selectedMember: undefined,
  isLoading: false,

  setGroup: (group) => {
    set({ isLoading: true, selectedGroup: group })
    try {
      const members = getGroupMembers(group)
      set({ allMembers: members })
      get().applyFilters()
      console.log(`Loaded ${members.length} members from ${group}`)
    } catch (err) {
      console.error(`Error loading ${group}:`, err)
    } finally {
      set({ isLoading: false })
    }
  },

  setFilters: (filters) => {
    set({ filters })
    get().applyFilters()
  },

applyFilters: () => {
  const { allMembers, filters } = get();

  const filtered = allMembers.filter((member) => {
    const matchGen = filters.gen
      ? filters.gen.includes(member.gen)
      : true;

    const matchGraduated =
      filters.graduated !== undefined
        ? member.graduated === filters.graduated
        : true;

    return matchGen && matchGraduated;
  });

  set({ filteredMembers: filtered });
},


  pickRandomMember: () => {
    const { filteredMembers } = get()
    if (filteredMembers.length === 0) return undefined
    const index = Math.floor(Math.random() * filteredMembers.length)
    const selected = filteredMembers[index]
    set({ selectedMember: selected })
    return selected
  }
}))

function getGroupMembers(group: Group): Member[] {
  if (group === 'hinatazaka') {
    return HinatazakaMembers
  }

  throw new Error(`未対応のグループ: ${group}`)
}

