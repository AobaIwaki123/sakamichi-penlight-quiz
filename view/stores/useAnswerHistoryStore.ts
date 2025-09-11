import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Group } from '@/types/Group'

// ============================================================================
// 型定義
// ============================================================================

/**
 * メンバー個別の回答履歴
 */
interface MemberAnswerHistory {
  /** メンバーID */
  memberId: number
  /** 正答数 */
  correctCount: number
  /** 不正答数 */
  incorrectCount: number
  /** 最後の回答時刻 */
  lastAnsweredAt: number
}

/**
 * グループ別の回答履歴
 */
interface GroupAnswerHistory {
  /** グループ名 */
  group: Group
  /** メンバー別履歴マップ */
  members: Record<number, MemberAnswerHistory>
}

/**
 * 回答履歴ストアの状態定義
 */
interface AnswerHistoryState {
  /** グループ別の回答履歴データ */
  history: Record<Group, GroupAnswerHistory>
}

/**
 * 回答履歴の統計情報
 */
interface MemberStatistics {
  /** メンバーID */
  memberId: number
  /** 正答数 */
  correctCount: number
  /** 不正答数 */
  incorrectCount: number
  /** 総回答数 */
  totalCount: number
  /** 正答率（0-1の小数） */
  accuracy: number
  /** 最後の回答時刻 */
  lastAnsweredAt: number
}

/**
 * 回答履歴ストアのアクション定義
 */
interface AnswerHistoryActions {
  /** 正答を記録する */
  recordCorrectAnswer: (group: Group, memberId: number) => void
  /** 不正答を記録する */
  recordIncorrectAnswer: (group: Group, memberId: number) => void
  /** 指定メンバーの統計情報を取得する */
  getMemberStatistics: (group: Group, memberId: number) => MemberStatistics
  /** 指定グループの全メンバー統計を取得する */
  getAllMemberStatistics: (group: Group) => MemberStatistics[]
  /** 正答率の低いメンバーIDの配列を取得する（回答数の少ないメンバーも含む） */
  getLowAccuracyMemberIds: (group: Group, options?: LowAccuracyOptions) => number[]
  /** 履歴をクリアする */
  clearHistory: (group?: Group) => void
}

/**
 * 低正答率メンバー取得のオプション
 */
interface LowAccuracyOptions {
  /** 正答率の閾値（デフォルト: 0.6） */
  accuracyThreshold?: number
  /** 最小回答数の閾値（この回数未満のメンバーも含める。デフォルト: 3） */
  minAnswerThreshold?: number
  /** 取得する最大メンバー数（デフォルト: 制限なし） */
  maxCount?: number
}

type AnswerHistoryStore = AnswerHistoryState & AnswerHistoryActions

// ============================================================================
// ストア実装
// ============================================================================

/**
 * 回答履歴管理用Zustandストア
 * メンバーごとの正答数・不正答数を追跡し、LocalStorageで永続化する
 */
export const useAnswerHistoryStore = create<AnswerHistoryStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      history: {},

      // 正答を記録
      recordCorrectAnswer: (group, memberId) => {
        const now = Date.now()
        
        set((state) => {
          const groupHistory = ensureGroupHistory(state.history, group)
          const memberHistory = ensureMemberHistory(groupHistory.members, memberId)
          
          return {
            history: {
              ...state.history,
              [group]: {
                ...groupHistory,
                members: {
                  ...groupHistory.members,
                  [memberId]: {
                    ...memberHistory,
                    correctCount: memberHistory.correctCount + 1,
                    lastAnsweredAt: now,
                  },
                },
              },
            },
          }
        })
        
        console.log(`正答記録: グループ=${group}, メンバーID=${memberId}`)
      },

      // 不正答を記録
      recordIncorrectAnswer: (group, memberId) => {
        const now = Date.now()
        
        set((state) => {
          const groupHistory = ensureGroupHistory(state.history, group)
          const memberHistory = ensureMemberHistory(groupHistory.members, memberId)
          
          return {
            history: {
              ...state.history,
              [group]: {
                ...groupHistory,
                members: {
                  ...groupHistory.members,
                  [memberId]: {
                    ...memberHistory,
                    incorrectCount: memberHistory.incorrectCount + 1,
                    lastAnsweredAt: now,
                  },
                },
              },
            },
          }
        })
        
        console.log(`不正答記録: グループ=${group}, メンバーID=${memberId}`)
      },

      // メンバー統計情報を取得
      getMemberStatistics: (group, memberId) => {
        const { history } = get()
        const groupHistory = history[group]
        const memberHistory = groupHistory?.members[memberId]
        
        if (!memberHistory) {
          // 履歴がない場合のデフォルト値
          return {
            memberId,
            correctCount: 0,
            incorrectCount: 0,
            totalCount: 0,
            accuracy: 0,
            lastAnsweredAt: 0,
          }
        }
        
        const totalCount = memberHistory.correctCount + memberHistory.incorrectCount
        const accuracy = totalCount > 0 ? memberHistory.correctCount / totalCount : 0
        
        return {
          memberId,
          correctCount: memberHistory.correctCount,
          incorrectCount: memberHistory.incorrectCount,
          totalCount,
          accuracy,
          lastAnsweredAt: memberHistory.lastAnsweredAt,
        }
      },

      // 全メンバー統計を取得
      getAllMemberStatistics: (group) => {
        const { history } = get()
        const groupHistory = history[group]
        
        if (!groupHistory) {
          return []
        }
        
        return Object.keys(groupHistory.members)
          .map((memberIdStr) => {
            const memberId = parseInt(memberIdStr, 10)
            return get().getMemberStatistics(group, memberId)
          })
          .sort((a, b) => {
            // 正答率の昇順でソート（低い方が先）
            if (a.accuracy === b.accuracy) {
              // 正答率が同じ場合は総回答数の昇順（少ない方が先）
              return a.totalCount - b.totalCount
            }
            return a.accuracy - b.accuracy
          })
      },

      // 低正答率メンバーIDを取得
      getLowAccuracyMemberIds: (group, options = {}) => {
        const {
          accuracyThreshold = 0.6,
          minAnswerThreshold = 3,
          maxCount,
        } = options
        
        const allStats = get().getAllMemberStatistics(group)
        
        // 低正答率または回答数が少ないメンバーをフィルタリング
        const lowAccuracyMembers = allStats.filter((stats) => {
          // 回答数が閾値未満の場合は含める（学習促進のため）
          if (stats.totalCount < minAnswerThreshold) {
            return true
          }
          
          // 正答率が閾値未満の場合は含める
          return stats.accuracy < accuracyThreshold
        })
        
        // maxCountが指定されている場合は制限する
        const targetMembers = maxCount
          ? lowAccuracyMembers.slice(0, maxCount)
          : lowAccuracyMembers
        
        const memberIds = targetMembers.map((stats) => stats.memberId)
        
        console.log(
          `低正答率メンバー取得: グループ=${group}, 閾値=${accuracyThreshold}, 対象=${memberIds.length}件`
        )
        
        return memberIds
      },

      // 履歴をクリア
      clearHistory: (group) => {
        if (group) {
          // 指定グループのみクリア
          set((state) => {
            const newHistory = { ...state.history }
            delete newHistory[group]
            return { history: newHistory }
          })
          console.log(`${group}の回答履歴をクリアしました`)
        } else {
          // 全履歴をクリア
          set({ history: {} })
          console.log('全ての回答履歴をクリアしました')
        }
      },
    }),
    {
      name: 'sakamichi-penlight-quiz-answer-history', // LocalStorage のキー
      version: 1,
    }
  )
)

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * グループ履歴の存在を保証し、存在しない場合は初期化する
 * @param history 履歴オブジェクト
 * @param group 対象グループ
 * @returns グループ履歴
 */
function ensureGroupHistory(
  history: Record<Group, GroupAnswerHistory>,
  group: Group
): GroupAnswerHistory {
  if (!history[group]) {
    return {
      group,
      members: {},
    }
  }
  return history[group]
}

/**
 * メンバー履歴の存在を保証し、存在しない場合は初期化する
 * @param members メンバー履歴マップ
 * @param memberId 対象メンバーID
 * @returns メンバー履歴
 */
function ensureMemberHistory(
  members: Record<number, MemberAnswerHistory>,
  memberId: number
): MemberAnswerHistory {
  if (!members[memberId]) {
    return {
      memberId,
      correctCount: 0,
      incorrectCount: 0,
      lastAnsweredAt: 0,
    }
  }
  return members[memberId]
}