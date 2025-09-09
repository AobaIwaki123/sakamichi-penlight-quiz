"use server";

import { BigQuery } from '@google-cloud/bigquery';

import type { Member } from '@/types/Member';
import { nogizakaMemberMock } from './mockData/nogizakaMemberMock';

/**
 * 乃木坂46のメンバー情報を取得する関数
 * BigQueryから最新のメンバーデータを取得し、開発環境ではモックデータを返す
 */
export async function getNogizakaMember(): Promise<Member[]> {
  // 開発モードかどうかをチェック
  const isDevMode = process.env.NODE_ENV === "development";

  if (isDevMode) {
    // devモードの場合はモックデータを返す
    console.log('モックデータを使用中（開発モード - 乃木坂46）');
    return nogizakaMemberMock;
  }

  // 本番環境ではBigQueryに接続
  const bigquery = new BigQuery();

  const query = `
   SELECT
     *
   FROM
     sakamichipenlightquiz.sakamichi.nogizaka_member_master
  `;

  const options = {
    query: query,
    location: 'US', // 必要に応じて適切なロケーションに変更
  };

  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  const [rows] = await job.getQueryResults();

  console.log('Rows:');
  for (const row of rows) {
    console.log(row);
  }

  return rows as Member[];
}