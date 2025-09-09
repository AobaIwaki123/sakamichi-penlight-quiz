import { getGroupConfig } from './groupConfigs';

// 型定義のエクスポート
export type PenlightColor = {
  id: number;
  name_ja: string;
  name_en: string;
  color: string;
};

// 日向坂46の設定を取得
const hinatazakaConfig = getGroupConfig('hinatazaka');

/**
 * @deprecated 新しいコードでは getGroupConfig('hinatazaka').penlightColors を使用してください
 */
export const hinatazakaPenlightColors: PenlightColor[] = hinatazakaConfig.penlightColors;
