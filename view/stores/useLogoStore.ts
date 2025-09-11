import { create } from 'zustand'

import type { Group } from "@/types/Group";

// ============================================================================
// 型定義・定数
// ============================================================================

/**
 * ロゴ情報の型定義
 */
interface Logo {
  /** グループ名 */
  name: Group
  /** ロゴ画像のURL */
  url: string
}

/**
 * 利用可能なロゴ一覧
 */
const AVAILABLE_LOGOS: Logo[] = [
  { name: 'hinatazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Hinatazaka46_logo.svg' },
  { name: 'sakurazaka', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Sakurazaka46_logo.svg' },
  { name: 'nogizaka', url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Nogizaka46_logo.svg' },
] as const;

/**
 * ロゴストアの状態定義
 */
interface LogoState {
  /** 現在のロゴインデックス */
  index: number
  /** 現在表示中のロゴ */
  current: Logo
}

/**
 * ロゴストアのアクション定義
 */
interface LogoActions {
  /** 次のロゴに切り替える */
  next: () => Logo
  /** 最初のロゴにリセットする */
  reset: () => void
}

type LogoStore = LogoState & LogoActions;

/**
 * ロゴ管理用Zustandストア
 * 複数のグループロゴを循環表示する機能を提供
 */
export const useLogoStore = create<LogoStore>((set, get) => ({
  // 初期状態
  index: 0,
  current: AVAILABLE_LOGOS[0],

  // 次のロゴに切り替え
  next: () => {
    const { index } = get();
    const nextIndex = (index + 1) % AVAILABLE_LOGOS.length;
    const nextLogo = AVAILABLE_LOGOS[nextIndex];
    
    set({ 
      index: nextIndex, 
      current: nextLogo 
    });
    
    return nextLogo;
  },

  // 最初のロゴにリセット
  reset: () => {
    set({ 
      index: 0, 
      current: AVAILABLE_LOGOS[0] 
    });
  },
}))
