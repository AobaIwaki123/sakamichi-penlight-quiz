/**
 * フィルター状態管理ストア
 */
import { create } from 'zustand';
import type { FilterState } from '@/types';

export const useFilterStore = create<FilterState>((set) => ({
  checkedFilters: {},
  setFilter: (type, checked) =>
    set((state) => ({
      checkedFilters: {
        ...state.checkedFilters,
        [type]: checked,
      },
    })),
}));
