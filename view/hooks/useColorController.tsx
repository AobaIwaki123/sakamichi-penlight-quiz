// hooks/useColorController.ts
import { useColorStore } from '@/stores/useColorStore';
import { hinatazakaPenlightColors } from '@/consts/colors';

export function useColorController(id: string) {
  const index = useColorStore((s) => s.colorMap[id]?.index ?? 0);
  const setIndex = useColorStore((s) => s.setIndex);

  const penlightColors = hinatazakaPenlightColors

  const next = () =>
    setIndex(id, (prev) => (prev + 1) % penlightColors.length);
  const prev = () =>
    setIndex(id, (prev) => (prev - 1 + penlightColors.length) % penlightColors.length);

  const current = penlightColors[index];

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
