"use server";

import type { Group } from '@/types/Group'
import type { Member } from '@/types/Member'
import { getMembersByGroup } from './index'

// ============================================================================
// 型定義
// ============================================================================

/**
 * 低正答率メンバー取得のオプション
 */
export interface LowAccuracyMemberOptions {
  /** 正答率の閾値（デフォルト: 0.6 = 60%） */
  accuracyThreshold?: number
  /** 最小回答数の閾値（この回数未満のメンバーも含める。デフォルト: 3） */
  minAnswerThreshold?: number
  /** 取得する最大メンバー数（デフォルト: 制限なし） */
  maxCount?: number
  /** 除外するメンバーIDの配列（デフォルト: []） */
  excludeIds?: number[]
}

/**
 * 低正答率メンバー取得結果
 */
export interface LowAccuracyMemberResult {
  /** 取得されたメンバー情報 */
  members: Member[]
  /** 使用された正答率閾値 */
  accuracyThreshold: number
  /** 使用された最小回答数閾値 */
  minAnswerThreshold: number
  /** 総取得件数 */
  totalCount: number
  /** 学習対象メンバー数（回答数が少ないメンバー） */
  learningTargetCount: number
  /** 低正答率メンバー数 */
  lowAccuracyCount: number
}

// ============================================================================
// クライアントサイド用関数（ブラウザでのみ実行）
// ============================================================================

/**
 * 正答数の低いメンバーを中心にピックアップする
 * ブラウザの正答履歴データを使用してメンバーを絞り込む
 * 
 * @param group 対象グループ（'hinatazaka' | 'sakurazaka'）
 * @param options 取得オプション
 * @returns Promise<LowAccuracyMemberResult> 低正答率メンバーの結果
 * 
 * @example
 * ```typescript
 * // 正答率60%未満のメンバーを最大10人取得
 * const result = await getLowAccuracyMembers('hinatazaka', {
 *   accuracyThreshold: 0.6,
 *   maxCount: 10
 * });
 * 
 * console.log(`取得したメンバー数: ${result.totalCount}`);
 * console.log(`学習対象メンバー: ${result.learningTargetCount}`);
 * ```
 */
export async function getLowAccuracyMembers(
  group: Group,
  options: LowAccuracyMemberOptions = {}
): Promise<LowAccuracyMemberResult> {
  const {
    accuracyThreshold = 0.6,
    minAnswerThreshold = 3,
    maxCount,
    excludeIds = []
  } = options

  // 全メンバー情報を取得
  const allMembers = await getMembersByGroup(group)
  
  // ブラウザ環境でのみ正答履歴データを取得
  let targetMemberIds: number[] = []
  let learningTargetCount = 0
  let lowAccuracyCount = 0
  
  if (typeof window !== 'undefined') {
    // 動的に正答履歴ストアをインポート（SSR対策）
    const { useAnswerHistoryStore } = await import('@/stores/useAnswerHistoryStore')
    const answerHistoryStore = useAnswerHistoryStore.getState()
    
    // 低正答率メンバーIDを取得
    const lowAccuracyMemberIds = answerHistoryStore.getLowAccuracyMemberIds(group, {
      accuracyThreshold,
      minAnswerThreshold,
      maxCount
    })
    
    // 除外IDを適用
    targetMemberIds = lowAccuracyMemberIds.filter(id => !excludeIds.includes(id))
    
    // 統計情報を計算
    const allStats = answerHistoryStore.getAllMemberStatistics(group)
    
    learningTargetCount = allStats.filter(stats => 
      stats.totalCount < minAnswerThreshold && !excludeIds.includes(stats.memberId)
    ).length
    
    lowAccuracyCount = allStats.filter(stats => 
      stats.totalCount >= minAnswerThreshold && 
      stats.accuracy < accuracyThreshold && 
      !excludeIds.includes(stats.memberId)
    ).length
    
    console.log(`低正答率メンバー取得実行:`, {
      group,
      accuracyThreshold,
      minAnswerThreshold,
      totalTargets: targetMemberIds.length,
      learningTargets: learningTargetCount,
      lowAccuracyTargets: lowAccuracyCount
    })
  } else {
    // サーバーサイドの場合はログ出力のみ
    console.log('サーバーサイドでの低正答率メンバー取得（正答履歴なし）:', { group })
  }
  
  // 対象メンバーIDが取得できない場合はランダムに選択
  if (targetMemberIds.length === 0) {
    console.log('低正答率メンバーが見つからないため、全メンバーからランダム選択を実行')
    targetMemberIds = allMembers
      .filter(member => !excludeIds.includes(member.id))
      .map(member => member.id)
      
    // maxCountが指定されている場合はシャッフルして制限
    if (maxCount && targetMemberIds.length > maxCount) {
      targetMemberIds = shuffleArray(targetMemberIds).slice(0, maxCount)
    }
  }
  
  // IDからメンバー情報を取得
  const targetMembers = allMembers.filter(member => 
    targetMemberIds.includes(member.id)
  )
  
  // 結果をメンバーIDの順序で並び替え（低正答率順を維持）
  const sortedMembers = targetMemberIds
    .map(id => allMembers.find(member => member.id === id))
    .filter((member): member is Member => member !== undefined)
  
  const result: LowAccuracyMemberResult = {
    members: sortedMembers,
    accuracyThreshold,
    minAnswerThreshold,
    totalCount: sortedMembers.length,
    learningTargetCount,
    lowAccuracyCount
  }
  
  console.log(`低正答率メンバー取得完了:`, {
    group,
    totalCount: result.totalCount,
    learningTargetCount: result.learningTargetCount,
    lowAccuracyCount: result.lowAccuracyCount
  })
  
  return result
}

/**
 * 低正答率メンバーからランダムに1人を選択する
 * 
 * @param group 対象グループ
 * @param options 取得オプション
 * @returns Promise<Member | null> 選択されたメンバー（対象がいない場合はnull）
 * 
 * @example
 * ```typescript
 * // 正答率の低いメンバーから1人をランダム選択
 * const member = await pickLowAccuracyMember('hinatazaka', {
 *   accuracyThreshold: 0.7,
 *   excludeIds: [1, 5, 10] // 最近出題されたメンバーを除外
 * });
 * 
 * if (member) {
 *   console.log(`選択されたメンバー: ${member.name}`);
 * }
 * ```
 */
export async function pickLowAccuracyMember(
  group: Group,
  options: LowAccuracyMemberOptions = {}
): Promise<Member | null> {
  const result = await getLowAccuracyMembers(group, {
    ...options,
    maxCount: undefined // 全候補から選択するため制限を外す
  })
  
  if (result.members.length === 0) {
    console.log('選択可能な低正答率メンバーが見つかりませんでした')
    return null
  }
  
  // ランダムに1人を選択
  const randomIndex = Math.floor(Math.random() * result.members.length)
  const selectedMember = result.members[randomIndex]
  
  console.log(`低正答率メンバーから選択: ${selectedMember.name} (ID: ${selectedMember.id})`)
  
  return selectedMember
}

// ============================================================================
// サーバーサイド用関数（統計情報なしの基本取得）
// ============================================================================

/**
 * サーバーサイド用: 正答履歴に関係なく全メンバーを取得する
 * クライアントサイドでの正答履歴フィルタリング前のベースデータとして使用
 * 
 * @param group 対象グループ
 * @param options 基本的なフィルタリングオプション
 * @returns Promise<Member[]> メンバー情報の配列
 */
export async function getAllMembersForLowAccuracyAnalysis(
  group: Group,
  options: Pick<LowAccuracyMemberOptions, 'maxCount' | 'excludeIds'> = {}
): Promise<Member[]> {
  const { maxCount, excludeIds = [] } = options
  
  console.log(`正答率分析用メンバー取得開始: グループ=${group}`)
  
  const allMembers = await getMembersByGroup(group)
  
  // 除外IDを適用
  const filteredMembers = allMembers.filter(member => 
    !excludeIds.includes(member.id)
  )
  
  // maxCountが指定されている場合は制限
  const resultMembers = maxCount && filteredMembers.length > maxCount
    ? filteredMembers.slice(0, maxCount)
    : filteredMembers
  
  console.log(`正答率分析用メンバー取得完了: ${resultMembers.length}件`)
  
  return resultMembers
}

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * Fisher-Yatesアルゴリズムで配列をシャッフルする
 * @param array シャッフルする配列（元の配列は変更されない）
 * @returns シャッフルされた新しい配列
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]
  }
  
  return shuffled
}