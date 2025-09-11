import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pickLowAccuracyMember, type LowAccuracyMemberOptions } from '@/api/bq/getLowAccuracyMembers'
import type { Group } from '@/types/Group'
import type { Member } from '@/types/Member'

// ============================================================================
// 型定義
// ============================================================================

/**
 * 低正答率メンバー選択ストアの状態定義
 */
interface LowAccuracyMemberState {
  /** 低正答率モードが有効かどうか */
  isEnabled: boolean
  /** 低正答率メンバー選択のオプション設定 */
  options: LowAccuracyMemberOptions
  /** 最後に選択されたメンバーのID（重複回避用） */
  lastSelectedIds: number[]
  /** 重複回避の履歴保持数（デフォルト: 5） */
  historySize: number
}

/**
 * 低正答率メンバー選択ストアのアクション定義
 */
interface LowAccuracyMemberActions {
  /** 低正答率モードの有効/無効を切り替える */
  toggleMode: () => void
  /** 低正答率モードを有効にする */
  enableMode: () => void
  /** 低正答率モードを無効にする */
  disableMode: () => void
  /** オプション設定を更新する */
  updateOptions: (options: Partial<LowAccuracyMemberOptions>) => void
  /** 低正答率メンバーを選択する */
  selectLowAccuracyMember: (group: Group) => Promise<Member | null>
  /** 選択履歴を記録する */
  recordSelection: (memberId: number) => void
  /** 選択履歴をクリアする */
  clearHistory: () => void
  /** 設定をデフォルトにリセットする */
  resetSettings: () => void
}

type LowAccuracyMemberStore = LowAccuracyMemberState & LowAccuracyMemberActions

// ============================================================================
// デフォルト設定
// ============================================================================

const DEFAULT_OPTIONS: LowAccuracyMemberOptions = {
  accuracyThreshold: 0.6,   // 60%未満を低正答率とする
  minAnswerThreshold: 3,    // 3問未満は学習対象
  maxCount: undefined,      // 取得数制限なし
  excludeIds: []            // 除外ID初期値は空
}

const DEFAULT_HISTORY_SIZE = 5 // 最近5件の選択を記録

// ============================================================================
// ストア実装
// ============================================================================

/**
 * 低正答率メンバー選択管理用Zustandストア
 * 正答数の低いメンバーを優先的に選択する機能を提供
 */
export const useLowAccuracyMemberStore = create<LowAccuracyMemberStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      isEnabled: false,
      options: { ...DEFAULT_OPTIONS },
      lastSelectedIds: [],
      historySize: DEFAULT_HISTORY_SIZE,

      // モード切り替え
      toggleMode: () => {
        const { isEnabled } = get()
        const newEnabled = !isEnabled
        set({ isEnabled: newEnabled })
        
        console.log(`低正答率モード: ${newEnabled ? '有効' : '無効'}`)
      },

      enableMode: () => {
        set({ isEnabled: true })
        console.log('低正答率モードを有効にしました')
      },

      disableMode: () => {
        set({ isEnabled: false })
        console.log('低正答率モードを無効にしました')
      },

      // オプション更新
      updateOptions: (newOptions) => {
        set((state) => ({
          options: {
            ...state.options,
            ...newOptions
          }
        }))
        
        console.log('低正答率オプションを更新:', newOptions)
      },

      // 低正答率メンバー選択
      selectLowAccuracyMember: async (group) => {
        const { isEnabled, options, lastSelectedIds } = get()
        
        // モードが無効の場合はnullを返す
        if (!isEnabled) {
          console.log('低正答率モードが無効のため、選択をスキップ')
          return null
        }

        try {
          // 重複回避のため、最近選択されたIDを除外リストに追加
          const excludeIds = [
            ...(options.excludeIds || []),
            ...lastSelectedIds
          ]

          // 低正答率メンバーを選択
          const selectedMember = await pickLowAccuracyMember(group, {
            ...options,
            excludeIds
          })

          if (selectedMember) {
            // 選択履歴を記録
            get().recordSelection(selectedMember.id)
            
            console.log(`低正答率メンバー選択成功: ${selectedMember.name} (ID: ${selectedMember.id})`)
            return selectedMember
          } else {
            console.log('低正答率メンバーが見つかりませんでした')
            return null
          }
        } catch (error) {
          console.error('低正答率メンバー選択中にエラーが発生:', error)
          return null
        }
      },

      // 選択履歴の記録
      recordSelection: (memberId) => {
        set((state) => {
          const newLastSelectedIds = [memberId, ...state.lastSelectedIds]
          
          // 履歴サイズを超えた場合は古いものを削除
          if (newLastSelectedIds.length > state.historySize) {
            newLastSelectedIds.splice(state.historySize)
          }
          
          return {
            lastSelectedIds: newLastSelectedIds
          }
        })
        
        console.log(`選択履歴を記録: メンバーID=${memberId}`)
      },

      // 履歴クリア
      clearHistory: () => {
        set({ lastSelectedIds: [] })
        console.log('選択履歴をクリアしました')
      },

      // 設定リセット
      resetSettings: () => {
        set({
          isEnabled: false,
          options: { ...DEFAULT_OPTIONS },
          lastSelectedIds: [],
          historySize: DEFAULT_HISTORY_SIZE
        })
        
        console.log('低正答率メンバー選択設定をリセットしました')
      },
    }),
    {
      name: 'sakamichi-penlight-quiz-low-accuracy-member', // LocalStorage のキー
      version: 1,
    }
  )
)

// ============================================================================
// 便利な関数
// ============================================================================

/**
 * 低正答率モードが有効で、かつ指定グループでメンバーを選択できるかチェックする
 * @param group 対象グループ
 * @returns Promise<boolean> 選択可能な場合true
 */
export async function canSelectLowAccuracyMember(group: Group): Promise<boolean> {
  const { isEnabled, selectLowAccuracyMember } = useLowAccuracyMemberStore.getState()
  
  if (!isEnabled) {
    return false
  }
  
  try {
    // 実際に選択を試して判定（コストが高い場合は別の判定方法を検討）
    const member = await selectLowAccuracyMember(group)
    return member !== null
  } catch (error) {
    console.error('低正答率メンバー選択可能性チェック中にエラー:', error)
    return false
  }
}

/**
 * 現在の低正答率モード設定を取得する
 * @returns LowAccuracyMemberState 現在の設定状態
 */
export function getLowAccuracyModeConfig(): LowAccuracyMemberState {
  const { isEnabled, options, lastSelectedIds, historySize } = useLowAccuracyMemberStore.getState()
  
  return {
    isEnabled,
    options,
    lastSelectedIds,
    historySize
  }
}

/**
 * 低正答率モードの詳細統計情報を表示する（デバッグ用）
 */
export function logLowAccuracyModeStatus(): void {
  const state = useLowAccuracyMemberStore.getState()
  
  console.group('📊 低正答率モード設定状況')
  console.log('🔧 有効状態:', state.isEnabled ? '有効' : '無効')
  console.log('📊 正答率閾値:', `${(state.options.accuracyThreshold || 0) * 100}%`)
  console.log('📝 最小回答数閾値:', state.options.minAnswerThreshold)
  console.log('🚫 除外ID:', state.options.excludeIds?.length || 0, '件')
  console.log('📚 最近の選択履歴:', state.lastSelectedIds.length, '件')
  console.log('⚙️ 履歴保持サイズ:', state.historySize)
  console.groupEnd()
}