// stores/useAnswerTriggerStore.ts
import { create } from 'zustand'

type AnswerTriggerStore = {
  triggerCount: number
  trigger: () => void
}

export const useAnswerTriggerStore = create<AnswerTriggerStore>((set) => ({
  triggerCount: 0,
  trigger: () => set((state) => ({ triggerCount: state.triggerCount + 1 })),
}))
