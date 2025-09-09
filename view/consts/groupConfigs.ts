import type { Group } from "@/types/Group";
import type { PenlightColor } from "./hinatazakaColors";

/**
 * グループごとの世代型定義
 */
export type HinatazakaGeneration = "1st" | "2nd" | "3rd" | "4th" | "5th" | "graduated";
export type SakurazakaGeneration = "1st" | "2nd" | "3rd" | "graduated";
export type NogizakaGeneration = "1st" | "2nd" | "3rd" | "4th" | "5th" | "graduated";

/**
 * 汎用世代型（Union型）
 */
export type Generation = HinatazakaGeneration | SakurazakaGeneration | NogizakaGeneration;

/**
 * フィルター定義の型
 */
export type Filter = {
  type: string;
  defaultChecked: boolean;
}

/**
 * グループ設定の型定義
 */
export interface GroupConfig {
  /** グループ名 */
  name: Group;
  /** 表示名 */
  displayName: string;
  /** ロゴURL */
  logoUrl: string;
  /** BigQueryテーブル名 */
  tableName: string;
  /** フィルター設定 */
  filters: Filter[];
  /** 世代マッピング */
  generationMap: { [key: string]: string };
  /** ペンライト色定義 */
  penlightColors: PenlightColor[];
  /** モックデータファイル名 */
  mockDataFile: string;
}

/**
 * 日向坂46の設定
 */
export const hinatazakaConfig: GroupConfig = {
  name: 'hinatazaka',
  displayName: '日向坂46',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Hinatazaka46_logo.svg',
  tableName: 'sakamichipenlightquiz.sakamichi.hinatazaka_member_master',
  filters: [
    { type: '1期生', defaultChecked: true },
    { type: '2期生', defaultChecked: true },
    { type: '3期生', defaultChecked: true },
    { type: '4期生', defaultChecked: true },
    { type: '5期生', defaultChecked: true },
    { type: '卒業生', defaultChecked: false },
  ],
  generationMap: {
    "1期生": "1st",
    "2期生": "2nd",
    "3期生": "3rd",
    "4期生": "4th",
    "5期生": "5th",
    "卒業生": "graduated",
  },
  penlightColors: [
    { id: 0, name_ja: 'パステルブルー', name_en: 'pastel_blue', color: '#09b8ff' },
    { id: 1, name_ja: 'エメラルドグリーン', name_en: 'emerald_green', color: '#7aea9f' },
    { id: 2, name_ja: 'グリーン', name_en: 'green', color: '#2bdd6' },
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
  ],
  mockDataFile: 'hinatazakaMemberMock',
};

/**
 * 櫻坂46の設定
 */
export const sakurazakaConfig: GroupConfig = {
  name: 'sakurazaka',
  displayName: '櫻坂46',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Sakurazaka46_logo.svg',
  tableName: 'sakamichipenlightquiz.sakamichi.sakurazaka_member_master',
  filters: [
    { type: '1期生', defaultChecked: true },
    { type: '2期生', defaultChecked: true },
    { type: '3期生', defaultChecked: true },
    { type: '卒業生', defaultChecked: false },
  ],
  generationMap: {
    "1期生": "1st",
    "2期生": "2nd", 
    "3期生": "3rd",
    "卒業生": "graduated",
  },
  penlightColors: [
    // 櫻坂46のペンライト色（仮の値、実際の色に要更新）
    { id: 0, name_ja: 'ピンク', name_en: 'pink', color: '#ff69b4' },
    { id: 1, name_ja: 'レッド', name_en: 'red', color: '#ff0000' },
    { id: 2, name_ja: 'オレンジ', name_en: 'orange', color: '#ffa500' },
    { id: 3, name_ja: 'イエロー', name_en: 'yellow', color: '#ffff00' },
    { id: 4, name_ja: 'グリーン', name_en: 'green', color: '#00ff00' },
    { id: 5, name_ja: 'ブルー', name_en: 'blue', color: '#0000ff' },
    { id: 6, name_ja: 'パープル', name_en: 'purple', color: '#800080' },
    { id: 7, name_ja: 'ホワイト', name_en: 'white', color: '#ffffff' },
  ],
  mockDataFile: 'sakurazakaMemberMock',
};

/**
 * 乃木坂46の設定
 */
export const nogizakaConfig: GroupConfig = {
  name: 'nogizaka',
  displayName: '乃木坂46',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Nogizaka46_logo.svg',
  tableName: 'sakamichipenlightquiz.sakamichi.nogizaka_member_master',
  filters: [
    { type: '1期生', defaultChecked: true },
    { type: '2期生', defaultChecked: true },
    { type: '3期生', defaultChecked: true },
    { type: '4期生', defaultChecked: true },
    { type: '5期生', defaultChecked: true },
    { type: '卒業生', defaultChecked: false },
  ],
  generationMap: {
    "1期生": "1st",
    "2期生": "2nd",
    "3期生": "3rd",
    "4期生": "4th",
    "5期生": "5th",
    "卒業生": "graduated",
  },
  penlightColors: [
    // 乃木坂46のペンライト色（仮の値、実際の色に要更新）
    { id: 0, name_ja: 'パープル', name_en: 'purple', color: '#9932cc' },
    { id: 1, name_ja: 'ピンク', name_en: 'pink', color: '#ff69b4' },
    { id: 2, name_ja: 'レッド', name_en: 'red', color: '#ff0000' },
    { id: 3, name_ja: 'オレンジ', name_en: 'orange', color: '#ffa500' },
    { id: 4, name_ja: 'イエロー', name_en: 'yellow', color: '#ffff00' },
    { id: 5, name_ja: 'グリーン', name_en: 'green', color: '#00ff00' },
    { id: 6, name_ja: 'ブルー', name_en: 'blue', color: '#0000ff' },
    { id: 7, name_ja: 'ホワイト', name_en: 'white', color: '#ffffff' },
  ],
  mockDataFile: 'nogizakaMemberMock',
};

/**
 * グループ設定のマップ
 */
export const groupConfigs: Record<Group, GroupConfig> = {
  hinatazaka: hinatazakaConfig,
  sakurazaka: sakurazakaConfig,
  nogizaka: nogizakaConfig,
};

/**
 * グループ設定を取得するヘルパー関数
 * @param group グループ名
 * @returns グループ設定
 */
export function getGroupConfig(group: Group): GroupConfig {
  return groupConfigs[group];
}

/**
 * 全グループ設定の配列を取得
 * @returns 全グループ設定の配列
 */
export function getAllGroupConfigs(): GroupConfig[] {
  return Object.values(groupConfigs);
}