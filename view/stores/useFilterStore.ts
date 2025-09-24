import { create } from "zustand";

// ============================================================================
// 型定義
// ============================================================================

/**
 * フィルターストアの状態定義
 */
interface FilterState {
  /** フィルタータイプごとのチェック状態を管理するマップ */
  checkedFilters: Record<string, boolean>;
}

/**
 * フィルターストアのアクション定義
 */
interface FilterActions {
  /** 指定されたフィルタータイプのチェック状態を設定する */
  setFilter: (type: string, checked: boolean) => void;
  /** 全てのフィルターをクリアする */
  clearAllFilters: () => void;
  /** 指定されたフィルターのチェック状態を取得する */
  isFilterChecked: (type: string) => boolean;
}

type FilterStore = FilterState & FilterActions;

/**
 * フィルター状態管理用Zustandストア
 * UIフィルターコンポーネントのチェック状態を管理する
 */
export const useFilterStore = create<FilterStore>((set, get) => ({
  // 初期状態
  checkedFilters: {},

  // 個別フィルターの設定
  setFilter: (type, checked) =>
    set((state) => ({
      checkedFilters: {
        ...state.checkedFilters,
        [type]: checked,
      },
    })),

  // 全フィルターのクリア
  clearAllFilters: () =>
    set(() => ({
      checkedFilters: {},
    })),

  // フィルターのチェック状態取得
  isFilterChecked: (type) => {
    const { checkedFilters } = get();
    return checkedFilters[type] ?? false;
  },
}));
