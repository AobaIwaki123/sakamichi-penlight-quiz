 "use server";

import type { Member } from '@/types/Member';
import { hinatazakaMemberMock } from './mockData/hinatazakaMemberMock';
import { fetchMemberData } from './common/queryUtils';

/**
 * BigQueryから日向坂46のメンバー情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<Member[]> 日向坂46メンバー情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const members = await getHinatazakaMember();
 * console.log(`取得したメンバー数: ${members.length}`);
 * ```
 */
export async function getHinatazakaMember(): Promise<Member[]> {
  return fetchMemberData('hinatazaka', hinatazakaMemberMock);
}
