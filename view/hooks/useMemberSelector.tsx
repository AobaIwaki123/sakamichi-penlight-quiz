import { useCallback } from 'react'
import { useSelectedMemberStore } from '@/stores/useSelectedMemberStore'
import { useLowAccuracyMemberStore } from '@/stores/useLowAccuracyMemberStore'
import type { Member } from '@/types/Member'

// ============================================================================
// 型定義
// ============================================================================

/**
 * メンバー選択モード
 */
export type MemberSelectionMode = 'random' | 'low-accuracy' | 'auto'

/**
 * メンバー選択の結果情報
 */
interface MemberSelectionResult {
  /** 選択されたメンバー */
  member: Member | null
  /** 使用された選択モード */
  mode: 'random' | 'low-accuracy'
  /** 選択成功したかどうか */
  success: boolean
  /** エラーメッセージ（失敗時） */
  error?: string
}

/**
 * メンバー選択設定
 */
interface MemberSelectorConfig {
  /** 選択モード（デフォルト: 'auto'） */
  mode?: MemberSelectionMode
  /** 低正答率モードで失敗した場合にランダム選択にフォールバックするか（デフォルト: true） */
  fallbackToRandom?: boolean
  /** 選択後に次のメンバーを自動で準備するか（デフォルト: true） */
  autoPickNext?: boolean
}

// ============================================================================
// カスタムフック
// ============================================================================

/**
 * メンバー選択機能を統合したカスタムフック
 * ランダム選択と低正答率優先選択を統合して管理する
 */
export function useMemberSelector(config: MemberSelectorConfig = {}) {
  const {
    mode = 'auto',
    fallbackToRandom = true,
    autoPickNext = true
  } = config

  // 既存のメンバー選択ストア
  const {
    selectedGroup,
    selectedMember,
    pickRandomMember,
    isLoading: isMemberLoading
  } = useSelectedMemberStore()

  // 低正答率メンバー選択ストア
  const {
    isEnabled: isLowAccuracyEnabled,
    selectLowAccuracyMember,
    toggleMode: toggleLowAccuracyMode,
    enableMode: enableLowAccuracyMode,
    disableMode: disableLowAccuracyMode
  } = useLowAccuracyMemberStore()

  /**
   * 設定された選択モードに基づいてメンバーを選択する
   */
  const selectMember = useCallback(async (
    overrideMode?: MemberSelectionMode
  ): Promise<MemberSelectionResult> => {
    const effectiveMode = overrideMode || mode

    try {
      // ランダム選択モード
      if (effectiveMode === 'random') {
        const member = pickRandomMember()

        if (member) {
          return {
            member,
            mode: 'random',
            success: true
          }
        } else {
          return {
            member: null,
            mode: 'random',
            success: false,
            error: 'ランダム選択でメンバーが見つかりませんでした'
          }
        }
      }

      // 低正答率優先選択モード
      if (effectiveMode === 'low-accuracy') {
        const member = await selectLowAccuracyMember(selectedGroup)

        if (member) {
          return {
            member,
            mode: 'low-accuracy',
            success: true
          }
        } else if (fallbackToRandom) {
          // フォールバック処理
          console.log('低正答率選択失敗、ランダム選択にフォールバック')
          const fallbackMember = pickRandomMember()

          return {
            member: fallbackMember,
            mode: 'random',
            success: fallbackMember !== undefined,
            error: fallbackMember ? undefined : '低正答率選択とランダム選択の両方が失敗しました'
          }
        } else {
          return {
            member: null,
            mode: 'low-accuracy',
            success: false,
            error: '低正答率メンバーが見つかりませんでした'
          }
        }
      }

      // 自動選択モード（低正答率モードが有効なら優先、そうでなければランダム）
      if (effectiveMode === 'auto') {
        if (isLowAccuracyEnabled) {
          return await selectMember('low-accuracy')
        } else {
          return await selectMember('random')
        }
      }

      return {
        member: null,
        mode: 'random',
        success: false,
        error: `未対応の選択モード: ${effectiveMode}`
      }

    } catch (error) {
      console.error('メンバー選択中にエラーが発生:', error)

      // エラー時のフォールバック処理
      if (fallbackToRandom && effectiveMode !== 'random') {
        console.log('エラー発生のためランダム選択にフォールバック')
        const fallbackMember = pickRandomMember()

        return {
          member: fallbackMember,
          mode: 'random',
          success: fallbackMember !== undefined,
          error: fallbackMember ? `${effectiveMode}モードでエラーが発生、ランダム選択にフォールバック` : 'すべての選択方法が失敗しました'
        }
      }

      return {
        member: null,
        mode: effectiveMode as 'random' | 'low-accuracy',
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      }
    }
  }, [mode, fallbackToRandom, selectedGroup, pickRandomMember, selectLowAccuracyMember, isLowAccuracyEnabled])

  /**
   * 次のメンバーを選択（結果を状態に反映）
   */
  const selectNextMember = useCallback(async (
    overrideMode?: MemberSelectionMode
  ): Promise<MemberSelectionResult> => {
    const result = await selectMember(overrideMode)

    if (result.success && result.member) {
      // 成功時は既存のストアには手動で設定する必要がない（API内で設定される）
      console.log(`メンバー選択完了: ${result.member.name} (${result.mode}モード)`)
    } else {
      console.warn('メンバー選択に失敗:', result.error)
    }

    return result
  }, [selectMember])

  /**
   * 現在の選択モード情報を取得
   */
  const getCurrentMode = useCallback((): MemberSelectionMode => {
    if (mode === 'auto') {
      return isLowAccuracyEnabled ? 'low-accuracy' : 'random'
    }
    return mode
  }, [mode, isLowAccuracyEnabled])

  /**
   * 低正答率モードの有効/無効を切り替え
   */
  const toggleLowAccuracy = useCallback(() => {
    toggleLowAccuracyMode()
    console.log('低正答率モードを切り替えました')
  }, [toggleLowAccuracyMode])

  return {
    // 現在の状態
    currentMember: selectedMember,
    currentGroup: selectedGroup,
    isLoading: isMemberLoading,

    // 低正答率モード設定
    isLowAccuracyEnabled,
    currentMode: getCurrentMode(),

    // メンバー選択関数
    selectMember,
    selectNextMember,
    selectRandom: () => selectMember('random'),
    selectLowAccuracy: () => selectMember('low-accuracy'),

    // モード制御
    toggleLowAccuracy,
    enableLowAccuracy: enableLowAccuracyMode,
    disableLowAccuracy: disableLowAccuracyMode,
  }
}