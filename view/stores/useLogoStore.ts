import { create } from 'zustand'
import { getAllGroupConfigs } from '@/consts/groupConfigs';
import type { Group } from "@/types/Group";

type Logo = {
  name: Group
  url: string
}

// 設定から動的にロゴ配列を生成
const logos: Logo[] = getAllGroupConfigs().map(config => ({
  name: config.name,
  url: config.logoUrl
}));

type LogoStore = {
  index: number
  current: Logo
  next: () => Logo
  reset: () => void
}

export const useLogoStore = create<LogoStore>((set, get) => ({
  index: 0,
  current: logos[0],
  next: () => {
    const nextIndex = (get().index + 1) % logos.length
    set({ index: nextIndex, current: logos[nextIndex] })
    return logos[nextIndex]
  },
  reset: () => set({ index: 0, current: logos[0] }),
}))
