import { create } from 'zustand'

type Logo = {
  name: string
  url: string
}

const logos: Logo[] = [
  { name: 'nogizaka', url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Nogizaka46_logo.svg' },
  { name: 'sakurazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Sakurazaka46_logo.svg' },
  { name: 'hinatazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Hinatazaka46_logo.svg' },
]

type LogoStore = {
  index: number
  current: Logo
  next: () => void
  reset: () => void
}

export const useLogoStore = create<LogoStore>((set, get) => ({
  index: 0,
  current: logos[0],
  next: () => {
    const nextIndex = (get().index + 1) % logos.length
    set({ index: nextIndex, current: logos[nextIndex] })
  },
  reset: () => set({ index: 0, current: logos[0] }),
}))
