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
    // 既に同じグループのデータを取得済みかつローディング中でない場合はスキップ
    const { currentGroup, penlightColors, isLoading } = get();
    if (currentGroup === group && penlightColors.length > 0 && !isLoading) {
      return;
    }

    set({ isLoading: true, error: null, currentGroup: group });

    try {
      let colors: PenlightColor[];
      
      if (group === 'hinatazaka') {
        colors = await getHinatazakaPenlight();
      } else if (group === 'sakurazaka') {
        colors = await getSakurazakaPenlight();
      } else {
        throw new Error(`サポートされていないグループです: ${group}`);
      }

      set({ 
        penlightColors: colors, 
        isLoading: false,
        error: null
      });

      console.log(`${group}のペンライト色データを取得しました: ${colors.length}件`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ペンライト色の取得に失敗しました';
      console.error(`${group}のペンライト色取得エラー:`, error);
      
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
