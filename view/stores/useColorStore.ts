// stores/colorStore.ts
import { create } from 'zustand';
import { usePenlightStore } from './usePenlightStore';

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
    const { penlightColors } = usePenlightStore.getState();
    const current = penlightColors[index];
    
    // ペンライト色データが未取得の場合はデフォルト値を返す
    if (!current) {
      return {
        index,
        nameJa: '未取得',
        nameEn: 'not_loaded',
        color: '#cccccc',
      };
    }
    
    return {
      index,
      nameJa: current.name_ja,
      nameEn: current.name_en,
      color: current.color,
    };
  },
}));
