"use client";

import { useState } from 'react';

export const customColors = {
  pastel_blue: '#09b8ff',
  emerald_green: '#7aea9f',
  green: '#2bdd6',
  pearl_green: '#72ff66',
  light_green: '#d3ff64',
  yellow: '#fff764',
  orange: '#ffab09',
  red: '#ff1818',
  white: '#f5f5f5',
  sakura_pink: '#ff9afd',
  pink: '#ff18f6',
  passion_pink: '#ff0988',
  violet: '#c029df',
  purple: '#9462d2',
  blue: '#1d72fe',
} as const;

const colorKeys = Object.keys(customColors) as (keyof typeof customColors)[];

export function useColorController() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % colorKeys.length);
  const prev = () => setIndex((prev) => (prev - 1 + colorKeys.length) % colorKeys.length);

  const key = colorKeys[index];
  const color = customColors[key];

  return {
    color,
    key,
    index,
    next,
    prev,
    allColors: customColors,
    allKeys: colorKeys,
  };
}
