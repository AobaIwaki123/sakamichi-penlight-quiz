"use server";

import { BigQuery } from '@google-cloud/bigquery';

import type { PenlightColor } from '@/types/PenlightColor';
import { sakurazakaPenlightMock } from './mockData/sakurazakaPenlightMock';

/**
 * BigQueryから櫻坂46のペンライト色情報を取得する関数
 * 開発環境ではモックデータを返し、本番環境ではBigQueryから取得する
 * 
 * @returns Promise<PenlightColor[]> ペンライト色情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 */
export async function getSakurazakaPenlight(): Promise<PenlightColor[]> {
  // 環境変数をチェック
  const isDevMode = process.env.NODE_ENV === "development";

  if (isDevMode) {
    console.log('ペンライト色のモックデータを使用中（開発モード）');
    return sakurazakaPenlightMock;
  }

  const bigquery = new BigQuery({
    projectId: 'sakamichipenlightquiz'
  });
  
  console.log('BigQuery設定:', {
    projectId: bigquery.projectId,
    location: 'US',
    dataset: 'sakurazaka',
    table: 'penlight'
  });

  // テーブル存在確認
  const dataset = bigquery.dataset('sakurazaka');
  const table = dataset.table('penlight');
  
  try {
    const [exists] = await table.exists();
    if (!exists) {
      console.warn('ペンライトテーブルが存在しません: sakamichipenlightquiz.sakamichi.sakurazaka_penlight');
      console.warn('モックデータにフォールバックします');
      return sakurazakaPenlightMock;
    }
    console.log('ペンライトテーブルの存在を確認しました');
  } catch (existsError) {
    console.error('テーブル存在確認エラー:', existsError);
    console.warn('モックデータにフォールバックします');
    return sakurazakaPenlightMock;
  }

  const query = `
    SELECT
      id,
      name_ja,
      name_en,
      color
    FROM
      sakamichipenlightquiz.sakamichi.sakurazaka_penlight
    ORDER BY
      id ASC
  `;

  const options = {
    query: query,
    location: 'US',
  };

  try {
    console.log('BigQueryクエリ実行開始:', query);
    const [job] = await bigquery.createQueryJob(options);
    console.log(`BigQueryジョブ開始: ${job.id}`);

    const [rows] = await job.getQueryResults();
    console.log(`ペンライト色データを取得しました: ${rows.length}件`);
    console.log('取得されたデータサンプル:', rows.slice(0, 3));

    return rows as PenlightColor[];
  } catch (error) {
    console.error('BigQueryからペンライト色データの取得に失敗しました:');
    console.error('エラー詳細:', error);
    console.error('実行したクエリ:', query);
    console.error('BigQueryオプション:', options);
    
    // BigQueryエラー時はモックデータにフォールバック
    console.warn('BigQueryエラーのため、モックデータにフォールバックします');
    return sakurazakaPenlightMock;
  }
}
