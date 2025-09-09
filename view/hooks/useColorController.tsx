// hooks/useColorController.ts
import { useColorStore } from '@/stores/useColorStore';
import { usePenlightStore } from '@/stores/usePenlightStore';

export function useColorController(id: string) {
  const index = useColorStore((s) => s.colorMap[id]?.index ?? 0);
  const setIndex = useColorStore((s) => s.setIndex);
  const penlightColors = usePenlightStore((s) => s.penlightColors);

  const next = () =>
    setIndex(id, (prev) => (prev + 1) % penlightColors.length);
  const prev = () =>
    setIndex(id, (prev) => (prev - 1 + penlightColors.length) % penlightColors.length);

  const current = penlightColors[index];

  // ペンライト色データが未取得の場合はデフォルト値を返す
  if (!current) {
    return {
      index,
      color: '#cccccc',
      nameJa: '未取得',
      nameEn: 'not_loaded',
      next: () => { },
      prev: () => { },
      allColors: [],
    };
  }

  return {
    index,
    color: current.color,
    nameJa: current.name_ja,
    nameEn: current.name_en,
    next,
    prev,
    allColors: penlightColors,
  };
}
