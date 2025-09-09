// stores/useFilterStore.ts
import { create } from 'zustand';

type FilterState = {
  checkedFilters: Record<string, boolean>;
  setFilter: (type: string, checked: boolean) => void;
  clearFilters: () => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  checkedFilters: {},
  setFilter: (type, checked) =>
    set((state) => ({
      checkedFilters: {
        ...state.checkedFilters,
        [type]: checked,
      },
    })),
  clearFilters: () =>
    set(() => ({
      checkedFilters: {},
    })),
}));
