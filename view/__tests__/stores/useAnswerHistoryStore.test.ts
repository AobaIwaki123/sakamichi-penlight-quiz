import { act, renderHook } from '@testing-library/react'
import { useAnswerHistoryStore } from '@/stores/useAnswerHistoryStore'
import type { Group } from '@/types/Group'

// LocalStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useAnswerHistoryStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useAnswerHistoryStore.getState().clearHistory()
    jest.clearAllMocks()
  })

  describe('正答・不正答の記録', () => {
    test('正答を正しく記録できる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        result.current.recordCorrectAnswer('hinatazaka', 1)
      })

      const stats = result.current.getMemberStatistics('hinatazaka', 1)
      expect(stats.correctCount).toBe(1)
      expect(stats.incorrectCount).toBe(0)
      expect(stats.totalCount).toBe(1)
      expect(stats.accuracy).toBe(1.0)
    })

    test('不正答を正しく記録できる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        result.current.recordIncorrectAnswer('hinatazaka', 1)
      })

      const stats = result.current.getMemberStatistics('hinatazaka', 1)
      expect(stats.correctCount).toBe(0)
      expect(stats.incorrectCount).toBe(1)
      expect(stats.totalCount).toBe(1)
      expect(stats.accuracy).toBe(0.0)
    })

    test('正答・不正答が混在する場合の正答率計算', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        // 正答2回、不正答1回
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordIncorrectAnswer('hinatazaka', 1)
      })

      const stats = result.current.getMemberStatistics('hinatazaka', 1)
      expect(stats.correctCount).toBe(2)
      expect(stats.incorrectCount).toBe(1)
      expect(stats.totalCount).toBe(3)
      expect(stats.accuracy).toBeCloseTo(0.667, 2)
    })
  })

  describe('グループ別データ管理', () => {
    test('異なるグループのデータが独立して管理される', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordIncorrectAnswer('sakurazaka', 1)
      })

      const hinatazakaStats = result.current.getMemberStatistics('hinatazaka', 1)
      const sakurazakaStats = result.current.getMemberStatistics('sakurazaka', 1)

      expect(hinatazakaStats.correctCount).toBe(1)
      expect(hinatazakaStats.incorrectCount).toBe(0)
      expect(sakurazakaStats.correctCount).toBe(0)
      expect(sakurazakaStats.incorrectCount).toBe(1)
    })
  })

  describe('低正答率メンバーの取得', () => {
    test('正答率の低いメンバーを正しく取得できる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        // メンバー1: 正答率50% (1/2)
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordIncorrectAnswer('hinatazaka', 1)

        // メンバー2: 正答率100% (2/2)
        result.current.recordCorrectAnswer('hinatazaka', 2)
        result.current.recordCorrectAnswer('hinatazaka', 2)

        // メンバー3: 正答率0% (0/2)
        result.current.recordIncorrectAnswer('hinatazaka', 3)
        result.current.recordIncorrectAnswer('hinatazaka', 3)
      })

      const lowAccuracyMembers = result.current.getLowAccuracyMemberIds('hinatazaka', {
        accuracyThreshold: 0.6, // 60%未満
        minAnswerThreshold: 2
      })

      // メンバー1(50%)とメンバー3(0%)が対象
      expect(lowAccuracyMembers).toContain(1)
      expect(lowAccuracyMembers).toContain(3)
      expect(lowAccuracyMembers).not.toContain(2) // 100%なので除外
    })

    test('回答数の少ないメンバーも学習対象として取得される', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        // メンバー1: 1回答のみ (学習対象)
        result.current.recordCorrectAnswer('hinatazaka', 1)

        // メンバー2: 3回答で高正答率 (対象外)
        result.current.recordCorrectAnswer('hinatazaka', 2)
        result.current.recordCorrectAnswer('hinatazaka', 2)
        result.current.recordCorrectAnswer('hinatazaka', 2)
      })

      const lowAccuracyMembers = result.current.getLowAccuracyMemberIds('hinatazaka', {
        accuracyThreshold: 0.6,
        minAnswerThreshold: 3 // 3問未満は学習対象
      })

      // メンバー1は回答数が少ないため学習対象として含まれる
      expect(lowAccuracyMembers).toContain(1)
      expect(lowAccuracyMembers).not.toContain(2) // 十分な回答数で高正答率
    })

    test('maxCountオプションで取得数を制限できる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        // 5人のメンバーをすべて低正答率にする
        for (let i = 1; i <= 5; i++) {
          result.current.recordIncorrectAnswer('hinatazaka', i)
          result.current.recordIncorrectAnswer('hinatazaka', i)
          result.current.recordIncorrectAnswer('hinatazaka', i)
        }
      })

      const lowAccuracyMembers = result.current.getLowAccuracyMemberIds('hinatazaka', {
        accuracyThreshold: 0.6,
        minAnswerThreshold: 3,
        maxCount: 3 // 最大3人まで
      })

      expect(lowAccuracyMembers).toHaveLength(3)
    })
  })

  describe('履歴のクリア', () => {
    test('特定グループの履歴のみクリアできる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordCorrectAnswer('sakurazaka', 1)
      })

      act(() => {
        result.current.clearHistory('hinatazaka')
      })

      const hinatazakaStats = result.current.getMemberStatistics('hinatazaka', 1)
      const sakurazakaStats = result.current.getMemberStatistics('sakurazaka', 1)

      expect(hinatazakaStats.totalCount).toBe(0) // クリアされた
      expect(sakurazakaStats.totalCount).toBe(1) // 残っている
    })

    test('全履歴をクリアできる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordCorrectAnswer('sakurazaka', 1)
      })

      act(() => {
        result.current.clearHistory() // 引数なしで全クリア
      })

      const hinatazakaStats = result.current.getMemberStatistics('hinatazaka', 1)
      const sakurazakaStats = result.current.getMemberStatistics('sakurazaka', 1)

      expect(hinatazakaStats.totalCount).toBe(0)
      expect(sakurazakaStats.totalCount).toBe(0)
    })
  })

  describe('統計情報の取得', () => {
    test('履歴がないメンバーはデフォルト値を返す', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      const stats = result.current.getMemberStatistics('hinatazaka', 999)

      expect(stats.memberId).toBe(999)
      expect(stats.correctCount).toBe(0)
      expect(stats.incorrectCount).toBe(0)
      expect(stats.totalCount).toBe(0)
      expect(stats.accuracy).toBe(0)
      expect(stats.lastAnsweredAt).toBe(0)
    })

    test('全メンバー統計は正答率の昇順でソートされる', () => {
      const { result } = renderHook(() => useAnswerHistoryStore())

      act(() => {
        // メンバー1: 正答率100%
        result.current.recordCorrectAnswer('hinatazaka', 1)
        result.current.recordCorrectAnswer('hinatazaka', 1)

        // メンバー2: 正答率50%
        result.current.recordCorrectAnswer('hinatazaka', 2)
        result.current.recordIncorrectAnswer('hinatazaka', 2)

        // メンバー3: 正答率0%
        result.current.recordIncorrectAnswer('hinatazaka', 3)
        result.current.recordIncorrectAnswer('hinatazaka', 3)
      })

      const allStats = result.current.getAllMemberStatistics('hinatazaka')

      expect(allStats).toHaveLength(3)
      expect(allStats[0].memberId).toBe(3) // 正答率0%が最初
      expect(allStats[1].memberId).toBe(2) // 正答率50%が次
      expect(allStats[2].memberId).toBe(1) // 正答率100%が最後
    })
  })
})