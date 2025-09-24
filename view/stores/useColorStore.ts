import { create } from "zustand";
import { usePenlightStore } from "./usePenlightStore";

// ============================================================================
// 型定義
// ============================================================================

/**
 * カラー選択インデックス情報
 */
interface ColorInfo {
  /** 現在選択されているペンライト色のインデックス */
  index: number;
}

/**
 * カラーデータの表示情報
 */
interface ColorDisplayData {
  /** 現在のインデックス */
  index: number;
  /** 日本語色名 */
  nameJa: string;
  /** 英語色名 */
  nameEn: string;
  /** HEX色コード */
  color: string;
}

/**
 * カラーストアの状態定義
 */
interface ColorState {
  /** IDごとのカラー選択状態を管理するマップ */
  colorMap: Record<string, ColorInfo>;
}

/**
 * カラーストアのアクション定義
 */
interface ColorActions {
  /** 指定されたIDのカラーインデックスを更新する */
  setIndex: (id: string, updater: (prev: number) => number) => void;
  /** 指定されたIDのカラー表示データを取得する */
  getColorData: (id: string) => ColorDisplayData;
}

type ColorStore = ColorState & ColorActions;

/**
 * カラー管理用Zustandストア
 * ペンライト色の選択状態とその表示データを管理する
 */
export const useColorStore = create<ColorStore>((set, get) => ({
  // 初期状態
  colorMap: {},

  // カラーインデックスの更新
  setIndex: (id, updater) =>
    set((state) => {
      const currentIndex = getCurrentIndex(state.colorMap, id);
      const newIndex = updater(currentIndex);

      return {
        colorMap: {
          ...state.colorMap,
          [id]: { index: newIndex },
        },
      };
    }),

  // カラーデータの取得
  getColorData: (id) => {
    const index = getCurrentIndex(get().colorMap, id);
    const { penlightColors } = usePenlightStore.getState();
    const selectedColor = penlightColors[index];

    // データ未取得時のフォールバック
    if (!selectedColor) {
      return createFallbackColorData(index);
    }

    // 正常なカラーデータを返す
    return {
      index,
      nameJa: selectedColor.name_ja,
      nameEn: selectedColor.name_en,
      color: selectedColor.color,
    };
  },
}));

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 指定されたIDの現在のインデックスを取得する
 * @param colorMap カラーマップ
 * @param id 対象のID
 * @returns 現在のインデックス（未設定の場合は0）
 */
function getCurrentIndex(
  colorMap: Record<string, ColorInfo>,
  id: string
): number {
  return colorMap[id]?.index ?? 0;
}

/**
 * データ未取得時のフォールバックカラーデータを作成する
 * @param index 現在のインデックス
 * @returns フォールバック用のカラーデータ
 */
function createFallbackColorData(index: number): ColorDisplayData {
  return {
    index,
    nameJa: "未取得",
    nameEn: "not_loaded",
    color: "#cccccc",
  };
}
