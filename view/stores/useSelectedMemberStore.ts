import type { Member } from '@/consts/hinatazakaMembers';
import { create } from 'zustand'
import { HinatazakaMembers } from '@/consts/hinatazakaMembers'

export type Group = 'nogizaka' | 'sakurazaka' | 'hinatazaka'

type State = {
  selectedGroup: Group
  allMembers: Member[]
  filters: Partial<Pick<Member, 'gen' | 'graduated' | 'type'>> // フィルタ可能な属性を絞る
  filteredMembers: Member[]
  selectedMember?: Member
  isLoading: boolean
  setGroup: (group: Group) => void
  setFilters: (filters: Partial<Pick<Member, 'gen' | 'graduated' | 'type'>>) => void
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
    const { allMembers, filters } = get()
    const filtered = allMembers.filter((member) => {
      return Object.entries(filters).every(([key, value]) => {
        return member[key as keyof Member] === value
      })
    })
    set({ filteredMembers: filtered })
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
  return []
}
