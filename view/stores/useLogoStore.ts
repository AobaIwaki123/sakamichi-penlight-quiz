import { create } from 'zustand'

import type { Group } from "@/types/Group";

type Logo = {
  name: Group
  url: string
}

const logos: Logo[] = [
  { name: 'hinatazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Hinatazaka46_logo.svg' },
  { name: 'sakurazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Sakurazaka46_logo.svg' },
  { name: 'nogizaka', url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Nogizaka46_logo.svg' },
]

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
