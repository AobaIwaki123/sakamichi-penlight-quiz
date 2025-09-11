"use server";

import type { Member } from '@/types/Member';
import { sakurazakaMemberMock } from './mockData/sakurazakaMemberMock';
import { fetchMemberData } from './common/queryUtils';

/**
 * BigQueryから櫻坂46のメンバー情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<Member[]> 櫻坂46メンバー情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const members = await getSakurazakaMember();
 * console.log(`取得したメンバー数: ${members.length}`);
 * ```
 */
export async function getSakurazakaMember(): Promise<Member[]> {
  return fetchMemberData('sakurazaka', sakurazakaMemberMock);
}
