import { create } from "zustand";
import { getHinatazakaPenlight } from "@/api/bq/getHinatazakaPenlight";
import { getSakurazakaPenlight } from "@/api/bq/getSakurazakaPenlight";
import type { Group } from "@/types/Group";
import type { PenlightColor } from "@/types/PenlightColor";

/**
 * グループ別キャッシュデータ
 */
interface CachedPenlightData {
  /** ペンライト色データ */
  data: PenlightColor[];
  /** キャッシュ作成時刻 */
  cachedAt: number;
}

/**
 * ペンライト色情報の状態管理
 */
interface PenlightState {
  /** 現在のグループ */
  currentGroup: Group;
  /** ペンライト色のリスト */
  penlightColors: PenlightColor[];
  /** グループ別キャッシュ */
  cache: Partial<Record<Group, CachedPenlightData>>;
  /** キャッシュ有効期限（ミリ秒） */
  cacheExpiry: number;
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
  fetchPenlightColors: (group: Group, forceRefresh?: boolean) => Promise<void>;
  /** IDからペンライト色情報を取得する */
  getPenlightById: (id: number) => PenlightColor | undefined;
  /** エラーをクリアする */
  clearError: () => void;
  /** 指定グループのキャッシュをクリアする */
  clearCache: (group?: Group) => void;
  /** キャッシュが有効かチェックする */
  isCacheValid: (group: Group) => boolean;
}

type PenlightStore = PenlightState & PenlightActions;

/**
 * ペンライト色管理用のZustandストア
 */
export const usePenlightStore = create<PenlightStore>((set, get) => ({
  // 初期状態
  currentGroup: "hinatazaka",
  penlightColors: [],
  cache: {},
  cacheExpiry: 5 * 60 * 1000, // 5分間のキャッシュ
  isLoading: false,
  error: null,

  // アクション
  fetchPenlightColors: async (group: Group, forceRefresh = false) => {
    const { isLoading, cache, cacheExpiry } = get();

    // ローディング中の場合はスキップ
    if (isLoading) {
      return;
    }

    // キャッシュチェック（強制更新でない場合）
    if (!forceRefresh && isCacheValidForGroup(cache, group, cacheExpiry)) {
      const cachedData = cache[group]!.data;
      set({
        currentGroup: group,
        penlightColors: cachedData,
        error: null,
      });
      console.log(
        `${group}のペンライト色データをキャッシュから取得: ${cachedData.length}件`
      );
      return;
    }

    // ローディング開始
    set({ isLoading: true, error: null, currentGroup: group });

    try {
      // グループに応じたペンライトデータを取得
      const penlightColors = await fetchPenlightDataByGroup(group);
      const now = Date.now();

      // 成功時の状態更新（キャッシュも更新）
      set((state) => ({
        penlightColors,
        isLoading: false,
        error: null,
        cache: {
          ...state.cache,
          [group]: {
            data: penlightColors,
            cachedAt: now,
          },
        },
      }));

      console.log(
        `${group}のペンライト色データ取得完了: ${penlightColors.length}件（キャッシュ更新）`
      );
    } catch (error) {
      // エラー時の状態更新
      const errorMessage = extractErrorMessage(error);
      console.error(`${group}のペンライト色取得失敗:`, error);

      set({
        penlightColors: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  getPenlightById: (id: number) => {
    const { penlightColors } = get();
    return penlightColors.find((color) => color.id === id);
  },

  clearError: () => {
    set({ error: null });
  },

  clearCache: (group?: Group) => {
    if (group) {
      // 指定グループのキャッシュのみクリア
      set((state) => {
        const newCache = { ...state.cache };
        delete newCache[group];
        return { cache: newCache };
      });
      console.log(`${group}のキャッシュをクリアしました`);
    } else {
      // 全キャッシュをクリア
      set({ cache: {} });
      console.log("全てのキャッシュをクリアしました");
    }
  },

  isCacheValid: (group: Group) => {
    const { cache, cacheExpiry } = get();
    return isCacheValidForGroup(cache, group, cacheExpiry);
  },
}));

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 指定グループのキャッシュが有効かを判定する
 * @param cache キャッシュオブジェクト
 * @param group 対象グループ
 * @param cacheExpiry キャッシュ有効期限（ミリ秒）
 * @returns キャッシュが有効な場合true
 */
function isCacheValidForGroup(
  cache: Partial<Record<Group, CachedPenlightData>>,
  group: Group,
  cacheExpiry: number
): boolean {
  const cachedData = cache[group];
  if (!cachedData || cachedData.data.length === 0) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - cachedData.cachedAt;
  return cacheAge < cacheExpiry;
}

/**
 * グループに応じたペンライトデータを取得する
 * @param group 取得対象のグループ
 * @returns ペンライト色データの配列
 * @throws 未対応のグループの場合エラー
 */
async function fetchPenlightDataByGroup(
  group: Group
): Promise<PenlightColor[]> {
  switch (group) {
    case "hinatazaka":
      return getHinatazakaPenlight();
    case "sakurazaka":
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
  return error instanceof Error
    ? error.message
    : "ペンライト色の取得に失敗しました";
}
