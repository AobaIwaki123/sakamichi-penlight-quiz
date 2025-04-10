import { useState } from 'react';
import { penlightColors } from '@/consts/colors';

export function useColorController() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % penlightColors.length);
  const prev = () => setIndex((prev) => (prev - 1 + penlightColors.length) % penlightColors.length);

  const current = penlightColors[index];

  return {
    color: current.color,
    nameJa: current.name_ja,
    nameEn: current.name_en,
    index,
    next,
    prev,
    allColors: penlightColors,
  };
}
