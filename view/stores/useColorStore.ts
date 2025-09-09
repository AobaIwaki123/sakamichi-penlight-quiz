/**
 * ペンライト色の状態管理ストア
 */
import { create } from 'zustand';
import type { ColorState } from '@/types';
import { HINATAZAKA_PENLIGHT_COLORS } from '@/constants';

export const useColorStore = create<ColorState>((set, get) => ({
  colorMap: {},
  setIndex: (id, updater) =>
    set((state) => {
      const currentIndex = state.colorMap[id]?.index ?? 0;
      return {
        colorMap: {
          ...state.colorMap,
          [id]: {
            index: updater(currentIndex),
          },
        },
      };
    }),
  getColorData: (id) => {
    const index = get().colorMap[id]?.index ?? 0;
    const current = HINATAZAKA_PENLIGHT_COLORS[index];
    return {
      index,
      nameJa: current.name_ja,
      nameEn: current.name_en,
      color: current.color,
    };
  },
}));
