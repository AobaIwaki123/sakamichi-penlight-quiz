import { create } from 'zustand';

import type { PenlightColor } from '@/types/PenlightColor';
import type { Group } from '@/types/Group';
import { getHinatazakaPenlight } from '@/api/bq/getHinatazakaPenlight';
import { getSakurazakaPenlight } from '@/api/bq/getSakurazakaPenlight';

/**
 * ペンライト色情報の状態管理
 */
interface PenlightState {
  /** 現在のグループ */
  currentGroup: Group;
  /** ペンライト色のリスト */
  penlightColors: PenlightColor[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: string | null;
}

/**
 * ペンライト色管理のアクション
 */
interface PenlightActions {
  /** 指定されたグループのペンライト色を取得する */
  fetchPenlightColors: (group: Group) => Promise<void>;
  /** IDからペンライト色情報を取得する */
  getPenlightById: (id: number) => PenlightColor | undefined;
  /** エラーをクリアする */
  clearError: () => void;
}

type PenlightStore = PenlightState & PenlightActions;

/**
 * ペンライト色管理用のZustandストア
 */
export const usePenlightStore = create<PenlightStore>((set, get) => ({
  // 初期状態
  currentGroup: 'hinatazaka',
  penlightColors: [],
  isLoading: false,
  error: null,

  // アクション
  fetchPenlightColors: async (group: Group) => {
    const { currentGroup, penlightColors, isLoading } = get();
    
    // 重複取得の回避: 同じグループのデータが既に取得済みの場合はスキップ
    if (shouldSkipFetch(currentGroup, group, penlightColors, isLoading)) {
      return;
    }

    // ローディング開始
    set({ isLoading: true, error: null, currentGroup: group });

    try {
      // グループに応じたペンライトデータを取得
      const penlightColors = await fetchPenlightDataByGroup(group);

      // 成功時の状態更新
      set({ 
        penlightColors, 
        isLoading: false,
        error: null
      });

      console.log(`${group}のペンライト色データ取得完了: ${penlightColors.length}件`);
    } catch (error) {
      // エラー時の状態更新
      const errorMessage = extractErrorMessage(error);
      console.error(`${group}のペンライト色取得失敗:`, error);
      
      set({ 
        penlightColors: [], 
        isLoading: false, 
        error: errorMessage 
      });
    }
  },

  getPenlightById: (id: number) => {
    const { penlightColors } = get();
    return penlightColors.find(color => color.id === id);
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 重複取得をスキップすべきかを判定する
 * @param currentGroup 現在のグループ
 * @param targetGroup 取得対象のグループ
 * @param penlightColors 現在のペンライト色データ
 * @param isLoading ローディング状態
 * @returns スキップすべき場合true
 */
function shouldSkipFetch(
  currentGroup: Group, 
  targetGroup: Group, 
  penlightColors: PenlightColor[], 
  isLoading: boolean
): boolean {
  return currentGroup === targetGroup && penlightColors.length > 0 && !isLoading;
}

/**
 * グループに応じたペンライトデータを取得する
 * @param group 取得対象のグループ
 * @returns ペンライト色データの配列
 * @throws 未対応のグループの場合エラー
 */
async function fetchPenlightDataByGroup(group: Group): Promise<PenlightColor[]> {
  switch (group) {
    case 'hinatazaka':
      return getHinatazakaPenlight();
    case 'sakurazaka':
      return getSakurazakaPenlight();
    default:
      throw new Error(`サポートされていないグループです: ${group}`);
  }
}

/**
 * エラーオブジェクトからユーザー向けメッセージを抽出する
 * @param error エラーオブジェクト
 * @returns ユーザー向けエラーメッセージ
 */
function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'ペンライト色の取得に失敗しました';
}
