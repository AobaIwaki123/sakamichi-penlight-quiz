/**
 * 坂道ペンライトクイズアプリケーションの型定義
 * 全ての型定義を統合管理する
 */

// ===== 基本型定義 =====

/**
 * 坂道グループの種類
 */
export type Group = 'nogizaka' | 'sakurazaka' | 'hinatazaka';

/**
 * 期生の種類
 */
export type Generation = '1st' | '2nd' | '3rd' | '4th' | '5th' | 'graduated';

// ===== メンバー関連型 =====

/**
 * 坂道グループメンバーの情報を表すインターフェース
 */
export interface Member {
  /** メンバーID */
  id: number;
  /** メンバー名（フルネーム） */
  name: string;
  /** ニックネーム（任意） */
  nickname: string;
  /** 代表絵文字 */
  emoji: string;
  /** 所属期生 */
  gen: Generation;
  /** 卒業済みかどうか */
  graduated: boolean;
  /** ペンライト色1のID */
  penlight1_id: number;
  /** ペンライト色2のID */
  penlight2_id: number;
  /** 画像タイプ */
  type: string;
  /** 画像URL */
  url: string;
}

// ===== ペンライト関連型 =====

/**
 * ペンライト色の情報
 */
export interface PenlightColor {
  /** ペンライト色ID */
  id: number;
  /** 日本語名 */
  name_ja: string;
  /** 英語名 */
  name_en: string;
  /** カラーコード */
  color: string;
}

/**
 * ペンライト色選択の状態情報
 */
export interface ColorInfo {
  /** 現在選択されているインデックス */
  index: number;
}

/**
 * ペンライト色データの取得結果
 */
export interface ColorData {
  /** 現在のインデックス */
  index: number;
  /** 日本語名 */
  nameJa: string;
  /** 英語名 */
  nameEn: string;
  /** カラーコード */
  color: string;
}

// ===== フィルター関連型 =====

/**
 * フィルターの設定項目
 */
export interface Filter {
  /** フィルタータイプ（期生名など） */
  type: string;
  /** デフォルトでチェックされているか */
  defaultChecked: boolean;
}

/**
 * メンバーフィルタリングの条件
 */
export interface MemberFilters {
  /** 期生フィルター（複数選択可） */
  gen?: Generation[];
  /** 卒業生の表示フィルター */
  graduated?: boolean;
}

// ===== ストア関連型 =====

/**
 * 色管理ストアの状態
 */
export interface ColorState {
  /** ID別の色情報マップ */
  colorMap: Record<string, ColorInfo>;
  /** インデックス設定関数 */
  setIndex: (id: string, updater: (prev: number) => number) => void;
  /** 色データ取得関数 */
  getColorData: (id: string) => ColorData;
}

/**
 * フィルターストアの状態
 */
export interface FilterState {
  /** チェック状態のフィルターマップ */
  checkedFilters: Record<string, boolean>;
  /** フィルター設定関数 */
  setFilter: (type: string, checked: boolean) => void;
}

/**
 * 選択メンバーストアの状態
 */
export interface SelectedMemberState {
  /** 現在選択されているグループ */
  selectedGroup: Group;
  /** 無効なフィルター状態かどうか */
  hasInvalidFilter: boolean;
  /** 全メンバーリスト */
  allMembers: Member[];
  /** フィルター条件 */
  filters: MemberFilters;
  /** フィルタリング済みメンバーリスト */
  filteredMembers: Member[];
  /** シャッフル済みメンバーリスト */
  shuffledMembers: Member[];
  /** 現在のシャッフルインデックス */
  currentShuffleIndex: number;
  /** 現在選択されているメンバー */
  selectedMember?: Member;
  /** ローディング状態 */
  isLoading: boolean;
  /** グループ設定関数 */
  setGroup: (group: Group) => void;
  /** フィルター設定関数 */
  setFilters: (filters: MemberFilters) => void;
  /** フィルター適用関数 */
  applyFilters: () => void;
  /** メンバーシャッフル関数 */
  shuffleMembers: () => void;
  /** ランダムメンバー選択関数 */
  pickRandomMember: () => Member | undefined;
}

/**
 * 回答トリガーストアの状態
 */
export interface AnswerTriggerState {
  /** トリガー状態 */
  trigger: boolean;
  /** トリガー設定関数 */
  setTrigger: (trigger: boolean) => void;
}

/**
 * 回答終了トリガーストアの状態
 */
export interface AnswerCloseTriggerState {
  /** 終了トリガー状態 */
  closeTrigger: boolean;
  /** 終了トリガー設定関数 */
  setCloseTrigger: (closeTrigger: boolean) => void;
}

// ===== Hook関連型 =====

/**
 * カラーコントローラーhookの戻り値
 */
export interface UseColorControllerReturn {
  /** 現在のインデックス */
  index: number;
  /** 現在の色コード */
  color: string;
  /** 現在の日本語名 */
  nameJa: string;
  /** 現在の英語名 */
  nameEn: string;
  /** 次の色に進む関数 */
  next: () => void;
  /** 前の色に戻る関数 */
  prev: () => void;
  /** 全色データ */
  allColors: PenlightColor[];
}

// ===== ユーティリティ型 =====

/**
 * 期生の日本語表記から英語表記へのマッピング
 */
export type GenerationMap = Record<string, Generation>;

/**
 * API エラーレスポンス
 */
export interface ApiError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code?: string;
  /** 詳細情報 */
  details?: unknown;
}

/**
 * API 成功レスポンス
 */
export interface ApiResponse<T> {
  /** データ */
  data: T;
  /** 成功フラグ */
  success: boolean;
  /** メッセージ */
  message?: string;
}