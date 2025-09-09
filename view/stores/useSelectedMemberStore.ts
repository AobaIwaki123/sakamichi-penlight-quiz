/**
 * 選択メンバーの状態管理ストア
 */
import { create } from 'zustand';
import { getHinatazakaMember } from "@/api/bq/getHinatazakaMember";
import type { SelectedMemberState, Group, Member } from '@/types';

export const useSelectedMemberStore = create<SelectedMemberState>((set, get) => ({
  selectedGroup: 'hinatazaka',
  allMembers: [],
  filters: {},
  filteredMembers: [],
  shuffledMembers: [],
  currentShuffleIndex: 0,
  selectedMember: undefined,
  isLoading: false,
  hasInvalidFilter: false,

  setGroup: async (group) => {
    set({ isLoading: true, selectedGroup: group })
    try {
      const members = await getGroupMembers(group)
      console.log("members", members)
      set({ allMembers: members })
      get().applyFilters()
      console.log(`Loaded ${members.length} members from ${group}`)
      // Pick Random Member
      get().pickRandomMember()
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

    const hasValidFilter = filters.gen?.length !== 0 || filters.graduated !== undefined;

    const filtered = allMembers.filter((member) => {
      const matchGen = filters.gen ? filters.gen.includes(member.gen) : true;
      const matchGraduated = filters.graduated !== undefined
        ? member.graduated === filters.graduated
        : true;
      return matchGen && matchGraduated;
    });

    set({
      filteredMembers: filtered,
      hasInvalidFilter: hasValidFilter && filtered.length === 0
    });
    
    get().shuffleMembers();
  },
  
  shuffleMembers: () => {
    const { filteredMembers } = get();
    if (filteredMembers.length === 0) return;
    
    const shuffled = [...filteredMembers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    set({ shuffledMembers: shuffled, currentShuffleIndex: 0 });
  },


  pickRandomMember: () => {
    const {
      filteredMembers,
      shuffledMembers,
      currentShuffleIndex,
      shuffleMembers
    } = get()

    if (filteredMembers.length === 0) return undefined

    const needsReshuffle =
      shuffledMembers.length === 0 ||
      shuffledMembers.length !== filteredMembers.length ||
      currentShuffleIndex >= shuffledMembers.length

    if (needsReshuffle) {
      shuffleMembers()
    }

    const { shuffledMembers: currentShuffled, currentShuffleIndex: idx } = get()
    const selected = currentShuffled[idx]

    set({
      selectedMember: selected,
      currentShuffleIndex: idx + 1
    })

    return selected
  }
}))

async function getGroupMembers(group: Group): Promise<Member[]> {
  if (group === 'hinatazaka') {
    return getHinatazakaMember()
  }

  throw new Error(`未対応のグループ: ${group}`)
}

