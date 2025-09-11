"use server";

import type { PenlightColor } from '@/types/PenlightColor';
import { hinatazakaPenlightMock } from './mockData/hinatazakaPenlightMock';
import { fetchPenlightData } from './common/queryUtils';

/**
 * BigQueryから日向坂46のペンライト色情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<PenlightColor[]> 日向坂46ペンライト色情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const colors = await getHinatazakaPenlight();
 * console.log(`取得した色数: ${colors.length}`);
 * colors.forEach(color => console.log(`${color.name_ja}: ${color.color}`));
 * ```
 */
export async function getHinatazakaPenlight(): Promise<PenlightColor[]> {
  return fetchPenlightData('hinatazaka', hinatazakaPenlightMock);
}
