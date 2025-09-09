import { getGroupConfig } from './groupConfigs';
import type { PenlightColor } from './hinatazakaColors';

// 櫻坂46の設定を取得
const sakurazakaConfig = getGroupConfig('sakurazaka');

/**
 * 櫻坂46のペンライト色定義
 */
export const sakurazakaPenlightColors: PenlightColor[] = sakurazakaConfig.penlightColors;

export type { PenlightColor };