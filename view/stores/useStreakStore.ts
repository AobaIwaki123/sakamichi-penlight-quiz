import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveStreakRecord, generateStreakId } from '@/api/streak/streakApi'

// ============================================================================
// 型定義
// ============================================================================

/**
 * 連続正解記録の詳細情報
 */
interface StreakRecord {
  /** 連続正解数 */
  count: number
  /** 記録開始時刻 */
  startedAt: string
  /** 記録終了時刻（記録が途切れた場合のみ） */
  endedAt?: string
  /** 最後に正解した時刻 */
  lastCorrectAt: string
}

/**
 * 連続正解ストアの状態定義
 */
interface StreakState {
  /** 現在の連続正解数 */
  currentStreak: number
  /** 最高連続正解数 */
  bestStreak: number
  /** 合計正解数 */
  totalCorrect: number
  /** 合計回答数 */
  totalAnswers: number
  /** 現在の連続正解記録の詳細 */
  currentRecord?: StreakRecord
  /** 過去の連続正解記録一覧 */
  streakHistory: StreakRecord[]
}

/**
 * 連続正解ストアのアクション定義
 */
interface StreakActions {
  /** 正解時の処理 */
  recordCorrectAnswer: () => void
  /** 不正解時の処理 */
  recordIncorrectAnswer: () => void
  /** 記録をリセット */
  resetStats: () => void
  /** 正解率を取得 */
  getAccuracy: () => number
  /** 現在の記録を履歴に保存 */
  saveCurrentRecord: () => void
}

/**
 * 完全な連続正解ストア型定義
 */
type StreakStore = StreakState & StreakActions

/**
 * 連続正解管理用Zustandストア
 * クイズの連続正解数、最高記録、統計情報を管理し、データを永続化する
 */
export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      // ============================================================================
      // 初期状態
      // ============================================================================
      currentStreak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswers: 0,
      currentRecord: undefined,
      streakHistory: [],

      // ============================================================================
      // アクション
      // ============================================================================
      
      /**
       * 正解時の処理
       * 連続正解数を増加させ、必要に応じて最高記録を更新する
       */
      recordCorrectAnswer: () => {
        const now = new Date().toISOString();
        
        set((state) => {
          const newStreak = state.currentStreak + 1;
          const newBestStreak = Math.max(newStreak, state.bestStreak);
          
          // 新しい連続記録の開始または継続
          let updatedRecord: StreakRecord;
          
          if (state.currentRecord) {
            // 既存記録の継続
            updatedRecord = {
              ...state.currentRecord,
              count: newStreak,
              lastCorrectAt: now,
              endedAt: undefined  // 記録継続中なので終了時刻をクリア
            };
          } else {
            // 新しい記録の開始
            updatedRecord = {
              count: newStreak,
              startedAt: now,
              lastCorrectAt: now
            };
          }

          return {
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            totalCorrect: state.totalCorrect + 1,
            totalAnswers: state.totalAnswers + 1,
            currentRecord: updatedRecord
          };
        });

        console.log(`連続正解数: ${get().currentStreak}回`);
        
        // 最高記録更新をログ出力
        if (get().currentStreak === get().bestStreak && get().currentStreak > 1) {
          console.log(`🎉 最高記録を更新しました！ ${get().bestStreak}連続正解`);
        }
      },

      /**
       * 不正解時の処理  
       * 連続正解数をリセットし、現在の記録を履歴に保存する
       */
      recordIncorrectAnswer: () => {
        const { currentRecord, currentStreak } = get();
        
        set((state) => {
          // 記録を履歴に保存（2回以上連続正解した場合のみ）
          let updatedHistory = state.streakHistory;
          
          if (state.currentRecord && state.currentStreak >= 2) {
            const recordToSave: StreakRecord = {
              ...state.currentRecord,
              endedAt: new Date().toISOString()
            };
            updatedHistory = [...state.streakHistory, recordToSave];
          }

          return {
            currentStreak: 0,
            totalAnswers: state.totalAnswers + 1,
            currentRecord: undefined,
            streakHistory: updatedHistory
          };
        });

        // 2回以上の連続正解記録をAPIに保存
        if (currentRecord && currentStreak >= 2) {
          saveStreakRecord({
            id: generateStreakId(),
            streakCount: currentStreak,
            startedAt: currentRecord.startedAt,
            endedAt: new Date().toISOString(),
            lastCorrectAt: currentRecord.lastCorrectAt
          }).catch(error => {
            console.error('連続正解記録の保存に失敗しました:', error);
          });
        }

        console.log('不正解により連続記録がリセットされました');
      },

      /**
       * 統計情報をリセット
       * 開発・テスト用途での統計リセット機能
       */
      resetStats: () => {
        set({
          currentStreak: 0,
          bestStreak: 0,
          totalCorrect: 0,
          totalAnswers: 0,
          currentRecord: undefined,
          streakHistory: []
        });
        console.log('連続正解統計をリセットしました');
      },

      /**
       * 正解率を計算して取得
       * @returns 正解率（0.0-1.0の範囲）、回答がない場合は0
       */
      getAccuracy: () => {
        const { totalCorrect, totalAnswers } = get();
        return totalAnswers > 0 ? totalCorrect / totalAnswers : 0;
      },

      /**
       * 現在の記録を履歴に保存
       * ユーザーが意図的に記録を保存したい場合に使用
       */
      saveCurrentRecord: () => {
        const { currentRecord, streakHistory, currentStreak } = get();
        
        if (!currentRecord || currentStreak === 0) {
          console.log('保存する記録がありません');
          return;
        }

        const recordToSave: StreakRecord = {
          ...currentRecord,
          endedAt: new Date().toISOString()
        };

        set({
          streakHistory: [...streakHistory, recordToSave],
          currentRecord: undefined,
          currentStreak: 0
        });

        // APIに記録を保存（2回以上の場合のみ）
        if (currentStreak >= 2) {
          saveStreakRecord({
            id: generateStreakId(),
            streakCount: currentStreak,
            startedAt: currentRecord.startedAt,
            endedAt: recordToSave.endedAt!,
            lastCorrectAt: currentRecord.lastCorrectAt
          }).catch(error => {
            console.error('連続正解記録の手動保存に失敗しました:', error);
          });
        }

        console.log(`連続正解記録を手動保存しました: ${recordToSave.count}連続正解`);
      }
    }),
    {
      name: 'streak-storage', // localStorage のキー名
      version: 1,            // ストレージバージョン（スキーマ変更時にインクリメント）
    }
  )
);

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 連続正解記録をフォーマットした文字列で取得
 * @param record フォーマットする記録
 * @returns フォーマット済み文字列
 */
export function formatStreakRecord(record: StreakRecord): string {
  const startDate = new Date(record.startedAt).toLocaleDateString('ja-JP');
  const endDate = record.endedAt ? new Date(record.endedAt).toLocaleDateString('ja-JP') : '継続中';
  
  return `${record.count}連続正解 (${startDate} - ${endDate})`;
}

/**
 * 正解率をパーセント表示用にフォーマット
 * @param accuracy 正解率（0.0-1.0）
 * @returns フォーマット済み文字列（例: "85.3%"）
 */
export function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`;
}