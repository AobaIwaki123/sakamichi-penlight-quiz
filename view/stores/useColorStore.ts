import { hinatazakaPenlightColors } from '@/consts/hinatazakaColors';
// stores/colorStore.ts
import { create } from 'zustand';

type ColorInfo = {
  index: number;
};

type ColorState = {
  colorMap: Record<string, ColorInfo>;
  setIndex: (id: string, updater: (prev: number) => number) => void;
  getColorData: (id: string) => {
    index: number;
    nameJa: string;
    nameEn: string;
    color: string;
  };
};

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
    const current = hinatazakaPenlightColors[index];
    return {
      index,
      nameJa: current.name_ja,
      nameEn: current.name_en,
      color: current.color,
    };
  },
}));
