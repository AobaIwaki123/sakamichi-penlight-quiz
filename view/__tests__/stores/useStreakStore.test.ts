import { renderHook, act } from '@testing-library/react';
import { useStreakStore } from '@/stores/useStreakStore';

// ============================================================================
// モック設定
// ============================================================================

// API関数をモック化
jest.mock('@/api/streak/streakApi', () => ({
  saveStreakRecord: jest.fn().mockResolvedValue(true),
  generateStreakId: jest.fn(() => 'mock-streak-id-12345')
}));

describe('useStreakStore', () => {
  // 各テスト前にストアをリセット
  beforeEach(() => {
    useStreakStore.getState().resetStats();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('初期状態', () => {
    test('初期値が正しく設定されている', () => {
      const { result } = renderHook(() => useStreakStore());
      const state = result.current;

      expect(state.currentStreak).toBe(0);
      expect(state.bestStreak).toBe(0);
      expect(state.totalCorrect).toBe(0);
      expect(state.totalAnswers).toBe(0);
      expect(state.currentRecord).toBeUndefined();
      expect(state.streakHistory).toEqual([]);
      expect(state.getAccuracy()).toBe(0);
    });
  });

  describe('正解記録', () => {
    test('正解時に連続正解数が増加する', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.recordCorrectAnswer();
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.bestStreak).toBe(1);
      expect(result.current.totalCorrect).toBe(1);
      expect(result.current.totalAnswers).toBe(1);
      expect(result.current.currentRecord).toBeDefined();
      expect(result.current.getAccuracy()).toBe(1.0);
    });

    test('連続正解時に記録が正しく更新される', () => {
      const { result } = renderHook(() => useStreakStore());

      // 3回連続正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
      });

      expect(result.current.currentStreak).toBe(3);
      expect(result.current.bestStreak).toBe(3);
      expect(result.current.totalCorrect).toBe(3);
      expect(result.current.totalAnswers).toBe(3);
      expect(result.current.currentRecord?.count).toBe(3);
      expect(result.current.getAccuracy()).toBe(1.0);
    });

    test('最高記録が正しく更新される', () => {
      const { result } = renderHook(() => useStreakStore());

      // 最初の連続記録: 2回
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      expect(result.current.bestStreak).toBe(2);
      expect(result.current.currentStreak).toBe(0);

      // 2回目の連続記録: 4回（最高記録更新）
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
      });

      expect(result.current.bestStreak).toBe(4);
      expect(result.current.currentStreak).toBe(4);
    });
  });

  describe('不正解記録', () => {
    test('不正解時に連続記録がリセットされる', () => {
      const { result } = renderHook(() => useStreakStore());

      // 2回正解してから不正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(2);
      expect(result.current.totalCorrect).toBe(2);
      expect(result.current.totalAnswers).toBe(3);
      expect(result.current.currentRecord).toBeUndefined();
      expect(result.current.streakHistory).toHaveLength(1);
      expect(result.current.getAccuracy()).toBeCloseTo(0.667, 2);
    });

    test('1回のみの正解では履歴に保存されない', () => {
      const { result } = renderHook(() => useStreakStore());

      // 1回正解してから不正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.streakHistory).toHaveLength(0);
    });

    test('2回以上の連続正解では履歴に保存される', () => {
      const { result } = renderHook(() => useStreakStore());

      // 3回正解してから不正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      expect(result.current.streakHistory).toHaveLength(1);
      expect(result.current.streakHistory[0].count).toBe(3);
      expect(result.current.streakHistory[0].endedAt).toBeDefined();
    });
  });

  describe('正解率計算', () => {
    test('正解率が正しく計算される', () => {
      const { result } = renderHook(() => useStreakStore());

      // 5回回答中3回正解のケース
      act(() => {
        result.current.recordCorrectAnswer(); // 正解
        result.current.recordCorrectAnswer(); // 正解
        result.current.recordIncorrectAnswer(); // 不正解
        result.current.recordCorrectAnswer(); // 正解
        result.current.recordIncorrectAnswer(); // 不正解
      });

      expect(result.current.getAccuracy()).toBe(0.6); // 3/5 = 0.6
      expect(result.current.totalCorrect).toBe(3);
      expect(result.current.totalAnswers).toBe(5);
    });

    test('回答がない場合の正解率は0', () => {
      const { result } = renderHook(() => useStreakStore());
      expect(result.current.getAccuracy()).toBe(0);
    });

    test('全問正解の場合の正解率は1.0', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
      });

      expect(result.current.getAccuracy()).toBe(1.0);
    });
  });

  describe('手動保存機能', () => {
    test('現在の記録を手動保存できる', () => {
      const { result } = renderHook(() => useStreakStore());

      // 3回連続正解後に手動保存
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.saveCurrentRecord();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.currentRecord).toBeUndefined();
      expect(result.current.streakHistory).toHaveLength(1);
      expect(result.current.streakHistory[0].count).toBe(3);
    });

    test('記録がない場合は手動保存しない', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.saveCurrentRecord();
      });

      expect(result.current.streakHistory).toHaveLength(0);
    });
  });

  describe('統計リセット', () => {
    test('リセット機能が正常に動作する', () => {
      const { result } = renderHook(() => useStreakStore());

      // データを追加
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
        result.current.recordCorrectAnswer();
      });

      // リセット実行
      act(() => {
        result.current.resetStats();
      });

      // 初期状態に戻ることを確認
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.totalCorrect).toBe(0);
      expect(result.current.totalAnswers).toBe(0);
      expect(result.current.currentRecord).toBeUndefined();
      expect(result.current.streakHistory).toEqual([]);
      expect(result.current.getAccuracy()).toBe(0);
    });
  });

  describe('記録履歴管理', () => {
    test('複数の記録が履歴に正しく保存される', () => {
      const { result } = renderHook(() => useStreakStore());

      // 1回目の記録: 3連続正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      // 2回目の記録: 2連続正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      expect(result.current.streakHistory).toHaveLength(2);
      expect(result.current.streakHistory[0].count).toBe(3);
      expect(result.current.streakHistory[1].count).toBe(2);
      expect(result.current.bestStreak).toBe(3);
      expect(result.current.totalCorrect).toBe(5);
      expect(result.current.totalAnswers).toBe(7);
    });
  });

  describe('記録の時刻管理', () => {
    test('記録開始・終了時刻が正しく設定される', () => {
      const { result } = renderHook(() => useStreakStore());
      const startTime = new Date().getTime();

      // 2回正解してから不正解
      act(() => {
        result.current.recordCorrectAnswer();
        result.current.recordCorrectAnswer();
        result.current.recordIncorrectAnswer();
      });

      const endTime = new Date().getTime();
      const savedRecord = result.current.streakHistory[0];

      expect(savedRecord.startedAt).toBeDefined();
      expect(savedRecord.endedAt).toBeDefined();
      expect(savedRecord.lastCorrectAt).toBeDefined();
      
      // 時刻が妥当な範囲内にあることを確認
      const recordStartTime = new Date(savedRecord.startedAt).getTime();
      const recordEndTime = new Date(savedRecord.endedAt!).getTime();
      
      expect(recordStartTime).toBeGreaterThanOrEqual(startTime);
      expect(recordEndTime).toBeLessThanOrEqual(endTime);
      expect(recordEndTime).toBeGreaterThanOrEqual(recordStartTime);
    });
  });
});