import { getGroupConfig } from './groupConfigs';
import type { Filter, SakurazakaGeneration } from './groupConfigs';

// 櫻坂46の設定を取得
const sakurazakaConfig = getGroupConfig('sakurazaka');

/**
 * 櫻坂46のフィルター設定
 */
export const sakurazakaFilters: Filter[] = sakurazakaConfig.filters;

/**
 * 櫻坂46の世代型
 */
export type Generation = SakurazakaGeneration;

/**
 * 櫻坂46の世代マッピング
 */
export const GenerationMap: { [key: string]: string } = sakurazakaConfig.generationMap;