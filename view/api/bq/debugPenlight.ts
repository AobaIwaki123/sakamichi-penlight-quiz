"use server";

import { BigQuery } from '@google-cloud/bigquery';

/**
 * ペンライトテーブルのデバッグ用関数
 * テーブル構造とデータサンプルを確認する
 */
export async function debugPenlightTable(dataset: 'hinatazaka' | 'sakurazaka') {
  const bigquery = new BigQuery({
    projectId: 'sakamichipenlightquiz'
  });

  console.log(`=== ${dataset} ペンライトテーブルデバッグ開始 ===`);

  try {
    // 1. テーブル存在確認
    const bqDataset = bigquery.dataset(dataset);
    const table = bqDataset.table('penlight');
    
    const [exists] = await table.exists();
    console.log(`テーブル存在確認: ${exists ? '存在' : '存在しない'}`);
    
    if (!exists) {
      console.log('テーブルが存在しないため、デバッグを終了します');
      return { exists: false };
    }

    // 2. テーブルメタデータ取得
    const [metadata] = await table.getMetadata();
    console.log('テーブルスキーマ:', metadata.schema?.fields?.map((f: any) => `${f.name}: ${f.type}`));

    // 3. データ件数確認
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM sakamichipenlightquiz.sakamichi.${dataset}_penlight
    `;
    
    const [countJob] = await bigquery.createQueryJob({
      query: countQuery,
      location: 'US'
    });
    const [countRows] = await countJob.getQueryResults();
    console.log(`データ件数: ${countRows[0]?.count || 0}件`);

    // 4. サンプルデータ取得
    const sampleQuery = `
      SELECT * 
      FROM sakamichipenlightquiz.sakamichi.${dataset}_penlight
      ORDER BY id ASC
      LIMIT 5
    `;
    
    const [sampleJob] = await bigquery.createQueryJob({
      query: sampleQuery,
      location: 'US'
    });
    const [sampleRows] = await sampleJob.getQueryResults();
    console.log('サンプルデータ:', sampleRows);

    // 5. カラム名の確認
    const columnQuery = `
      SELECT column_name, data_type
      FROM sakamichipenlightquiz.sakamichi.INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'penlight'
      ORDER BY ordinal_position
    `;
    
    try {
      const [columnJob] = await bigquery.createQueryJob({
        query: columnQuery,
        location: 'US'
      });
      const [columnRows] = await columnJob.getQueryResults();
      console.log('カラム情報:', columnRows);
    } catch (schemaError) {
      console.log('INFORMATION_SCHEMAアクセスエラー（権限問題の可能性）:', schemaError);
    }

    return {
      exists: true,
      schema: metadata.schema?.fields,
      count: countRows[0]?.count || 0,
      sample: sampleRows
    };

  } catch (error) {
    console.error('%s ペンライトテーブルデバッグエラー:', dataset, error);
    return { exists: false, error: String(error) };
  }
}
