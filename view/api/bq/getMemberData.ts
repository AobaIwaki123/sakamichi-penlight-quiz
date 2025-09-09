"use server";

import { BigQuery } from '@google-cloud/bigquery';
import type { Group } from '@/types/Group';
import type { Member } from '@/types/Member';
import { getGroupConfig } from '@/consts/groupConfigs';

/**
 * 指定されたグループのメンバー情報を取得する汎用関数
 * 開発環境ではモックデータを返し、本番環境ではBigQueryからデータを取得する
 * 
 * @param group 取得するグループ名
 * @returns Promise<Member[]> メンバー情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 */
export async function getMemberData(group: Group): Promise<Member[]> {
  const config = getGroupConfig(group);
  
  // 環境変数をチェックして開発モードかどうか判定
  const isDevMode = process.env.NODE_ENV === "development";

  // 開発モードの場合はモックデータを返す
  if (isDevMode) {
    console.log(`Using mock data for ${config.displayName} in DEV_MODE`);
    return getMockData(group);
  }

  // 本番環境ではBigQueryに接続
  const bigquery = new BigQuery();

  const query = `
    SELECT
      *
    FROM
      ${config.tableName}
  `;

  const options = {
    query: query,
    location: 'US', // 必要に応じて適切なロケーションに変更
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started for ${config.displayName}.`);

    const [rows] = await job.getQueryResults();

    console.log(`Retrieved ${rows.length} members for ${config.displayName}`);
    for (const row of rows) {
      console.log(row);
    }

    return rows as Member[];
  } catch (error) {
    console.error(`Error fetching data for ${config.displayName}:`, error);
    throw new Error(`${config.displayName}のメンバー情報を取得できませんでした: ${error}`);
  }
}

/**
 * グループに対応するモックデータを動的に読み込む
 * @param group グループ名
 * @returns Promise<Member[]> モックデータ
 */
async function getMockData(group: Group): Promise<Member[]> {
  try {
    switch (group) {
      case 'hinatazaka':
        const { hinatazakaMemberMock } = await import('./mockData/hinatazakaMemberMock');
        return hinatazakaMemberMock;
      case 'sakurazaka':
        const { sakurazakaMemberMock } = await import('./mockData/sakurazakaMemberMock');
        return sakurazakaMemberMock;
      case 'nogizaka':
        // 乃木坂46のモックデータは未実装のため空配列を返す
        console.warn('Nogizaka46 mock data not implemented yet');
        return [];
      default:
        console.warn(`Mock data not found for ${group}, using empty array`);
        return [];
    }
  } catch (error) {
    console.warn(`Error loading mock data for ${group}:`, error);
    return [];
  }
}