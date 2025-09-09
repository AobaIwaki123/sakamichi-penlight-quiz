/**
 * 坂道ペンライトクイズアプリケーションの定数定義
 * 全ての定数を統合管理する
 */

import type { PenlightColor, Filter, GenerationMap, Group } from '@/types';

// ===== アプリケーション基本定数 =====

/**
 * サポートされている坂道グループ一覧
 */
export const SUPPORTED_GROUPS: Group[] = ['hinatazaka'] as const;

/**
 * デフォルトのグループ
 */
export const DEFAULT_GROUP: Group = 'hinatazaka';

// ===== 日向坂46関連定数 =====

/**
 * 日向坂46のペンライト色定義
 * BigQueryの penlight テーブルと対応
 */
export const HINATAZAKA_PENLIGHT_COLORS: PenlightColor[] = [
  { id: 0, name_ja: 'パステルブルー', name_en: 'pastel_blue', color: '#09b8ff' },
  { id: 1, name_ja: 'エメラルドグリーン', name_en: 'emerald_green', color: '#7aea9f' },
  { id: 2, name_ja: 'グリーン', name_en: 'green', color: '#2bdd66' },
  { id: 3, name_ja: 'パールグリーン', name_en: 'pearl_green', color: '#72ff66' },
  { id: 4, name_ja: 'ライトグリーン', name_en: 'light_green', color: '#d3ff64' },
  { id: 5, name_ja: 'イエロー', name_en: 'yellow', color: '#fff764' },
  { id: 6, name_ja: 'オレンジ', name_en: 'orange', color: '#ffab09' },
  { id: 7, name_ja: 'レッド', name_en: 'red', color: '#ff1818' },
  { id: 8, name_ja: 'ホワイト', name_en: 'white', color: '#f5f5f5' },
  { id: 9, name_ja: 'サクラピンク', name_en: 'sakura_pink', color: '#ff9afd' },
  { id: 10, name_ja: 'ピンク', name_en: 'pink', color: '#ff18f6' },
  { id: 11, name_ja: 'パッションピンク', name_en: 'passion_pink', color: '#ff0988' },
  { id: 12, name_ja: 'バイオレット', name_en: 'violet', color: '#c029df' },
  { id: 13, name_ja: 'パープル', name_en: 'purple', color: '#9462d2' },
  { id: 14, name_ja: 'ブルー', name_en: 'blue', color: '#1d72fe' },
] as const;

/**
 * 日向坂46のフィルター設定
 * 期生別および卒業生フィルター
 */
export const HINATAZAKA_FILTERS: Filter[] = [
  { type: '1期生', defaultChecked: true },
  { type: '2期生', defaultChecked: true },
  { type: '3期生', defaultChecked: true },
  { type: '4期生', defaultChecked: true },
  { type: '5期生', defaultChecked: true },
  { type: '卒業生', defaultChecked: false },
] as const;

/**
 * 期生の日本語表記から英語表記へのマッピング
 */
export const GENERATION_MAP: GenerationMap = {
  '1期生': '1st',
  '2期生': '2nd',
  '3期生': '3rd',
  '4期生': '4th',
  '5期生': '5th',
  '卒業生': 'graduated',
} as const;

/**
 * 英語表記から日本語表記へのマッピング
 */
export const GENERATION_REVERSE_MAP: Record<string, string> = {
  '1st': '1期生',
  '2nd': '2期生',
  '3rd': '3期生',
  '4th': '4期生',
  '5th': '5期生',
  'graduated': '卒業生',
} as const;

// ===== UI関連定数 =====

/**
 * アプリケーションの基本設定
 */
export const APP_CONFIG = {
  /** アプリケーション名 */
  name: '坂道ペンライトクイズ',
  /** アプリケーションの説明 */
  description: '日向坂46メンバーのペンライト色を当てるクイズアプリ',
  /** バージョン */
  version: '1.0.0',
  /** 開発者 */
  author: 'Sakamichi Quiz Team',
} as const;

/**
 * ローカルストレージのキー
 */
export const STORAGE_KEYS = {
  /** フィルター設定 */
  FILTERS: 'sakamichi-quiz-filters',
  /** テーマ設定 */
  THEME: 'sakamichi-quiz-theme',
  /** 最後に選択したグループ */
  LAST_GROUP: 'sakamichi-quiz-last-group',
} as const;

/**
 * APIエンドポイント
 */
export const API_ENDPOINTS = {
  /** 日向坂46メンバー取得 */
  HINATAZAKA_MEMBERS: '/api/bq/getHinatazakaMember',
} as const;

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  /** ネットワークエラー */
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  /** データ取得エラー */
  DATA_FETCH_ERROR: 'データの取得に失敗しました。しばらく時間をおいて再試行してください。',
  /** 未対応グループエラー */
  UNSUPPORTED_GROUP: '未対応のグループです。',
  /** フィルター結果なしエラー */
  NO_FILTER_RESULTS: '選択した条件に該当するメンバーが見つかりません。フィルター設定を確認してください。',
  /** 一般的なエラー */
  GENERAL_ERROR: '予期しないエラーが発生しました。',
} as const;

/**
 * 成功メッセージ
 */
export const SUCCESS_MESSAGES = {
  /** データ読み込み成功 */
  DATA_LOADED: 'データを正常に読み込みました。',
  /** フィルター適用成功 */
  FILTER_APPLIED: 'フィルターを適用しました。',
} as const;

// ===== デバッグ・開発用定数 =====

/**
 * 開発モードの判定
 */
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * 本番モードの判定
 */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * デバッグログの有効化
 */
export const DEBUG_ENABLED = IS_DEVELOPMENT || process.env.DEBUG === 'true';

/**
 * モックデータの使用判定
 */
export const USE_MOCK_DATA = IS_DEVELOPMENT || process.env.USE_MOCK === 'true';

// ===== 型ガード・ユーティリティ関数 =====

/**
 * グループが日向坂46かどうかを判定
 */
export const isHinatazaka = (group: Group): group is 'hinatazaka' => group === 'hinatazaka';

/**
 * 卒業生かどうかを判定
 */
export const isGraduated = (generation: string): boolean => generation === '卒業生' || generation === 'graduated';

/**
 * 有効な期生かどうかを判定
 */
export const isValidGeneration = (generation: string): boolean => {
  return Object.keys(GENERATION_MAP).includes(generation) || Object.values(GENERATION_MAP).includes(generation as any);
};

/**
 * ペンライト色IDからカラーオブジェクトを取得
 */
export const getPenlightColorById = (id: number): PenlightColor | undefined => {
  return HINATAZAKA_PENLIGHT_COLORS.find(color => color.id === id);
};

/**
 * ペンライト色名（日本語）からカラーオブジェクトを取得
 */
export const getPenlightColorByName = (nameJa: string): PenlightColor | undefined => {
  return HINATAZAKA_PENLIGHT_COLORS.find(color => color.name_ja === nameJa);
};