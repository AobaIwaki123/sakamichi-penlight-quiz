import { create } from 'zustand'

// ============================================================================
// 型定義
// ============================================================================

/**
 * 回答終了トリガーストアの状態・アクション定義
 */
interface AnswerCloseTriggerStore {
  /** トリガー発火回数 */
  triggerCount: number
  /** 回答終了トリガーを発火する */
  trigger: () => void
}

/**
 * 回答終了トリガー管理用Zustandストア
 * クイズ回答の終了タイミングを制御するためのトリガー機能を提供
 */
export const useAnswerCloseTriggerStore = create<AnswerCloseTriggerStore>((set) => ({
  // 初期状態
  triggerCount: 0,
  
  // トリガー発火
  trigger: () => set((state) => ({ 
    triggerCount: state.triggerCount + 1 
  })),
}))
