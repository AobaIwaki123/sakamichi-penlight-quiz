"use server";

import type { PenlightColor } from '@/types/PenlightColor';
import { sakurazakaPenlightMock } from './mockData/sakurazakaPenlightMock';
import { fetchPenlightData } from './common/queryUtils';

/**
 * BigQueryから櫻坂46のペンライト色情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<PenlightColor[]> 櫻坂46ペンライト色情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const colors = await getSakurazakaPenlight();
 * console.log(`取得した色数: ${colors.length}`);
 * colors.forEach(color => console.log(`${color.name_ja}: ${color.color}`));
 * ```
 */
export async function getSakurazakaPenlight(): Promise<PenlightColor[]> {
  return fetchPenlightData('sakurazaka', sakurazakaPenlightMock);
}
