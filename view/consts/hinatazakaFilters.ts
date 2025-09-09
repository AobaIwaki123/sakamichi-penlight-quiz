import { getGroupConfig } from './groupConfigs';
import type { Filter, HinatazakaGeneration } from './groupConfigs';

// 後方互換性のためのエクスポート
export type { Filter };

// 日向坂46の設定を取得
const hinatazakaConfig = getGroupConfig('hinatazaka');

/**
 * @deprecated 新しいコードでは getGroupConfig('hinatazaka').filters を使用してください
 */
export const hinatazakaFilters: Filter[] = hinatazakaConfig.filters;

/**
 * @deprecated 新しいコードでは HinatazakaGeneration を使用してください
 */
export type Generation = HinatazakaGeneration;

/**
 * @deprecated 新しいコードでは getGroupConfig('hinatazaka').generationMap を使用してください
 */
export const GenerationMap: { [key: string]: string } = hinatazakaConfig.generationMap;

