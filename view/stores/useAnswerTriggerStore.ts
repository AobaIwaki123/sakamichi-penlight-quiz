import { create } from 'zustand'

// ============================================================================
// 型定義
// ============================================================================

/**
 * 回答トリガーストアの状態・アクション定義
 */
interface AnswerTriggerStore {
  /** トリガー発火回数 */
  triggerCount: number
  /** 回答トリガーを発火する */
  trigger: () => void
}

/**
 * 回答トリガー管理用Zustandストア
 * クイズの回答タイミングを制御するためのトリガー機能を提供
 */
export const useAnswerTriggerStore = create<AnswerTriggerStore>((set) => ({
  // 初期状態
  triggerCount: 0,
  
  // トリガー発火
  trigger: () => set((state) => ({ 
    triggerCount: state.triggerCount + 1 
  })),
}))
