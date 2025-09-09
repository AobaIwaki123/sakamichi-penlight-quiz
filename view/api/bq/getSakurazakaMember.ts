"use server";

import type { Member } from '@/types/Member';
import { getMemberData } from './getMemberData';

/**
 * 櫻坂46のメンバー情報を取得する関数
 * BigQueryから最新のメンバーデータを取得し、開発環境ではモックデータを返す
 * 
 * @returns Promise<Member[]> メンバー情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 */
export async function getSakurazakaMember(): Promise<Member[]> {
  return getMemberData('sakurazaka');
}