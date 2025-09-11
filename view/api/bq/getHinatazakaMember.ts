 "use server";

import { BigQuery } from '@google-cloud/bigquery';

import type { Member } from '@/types/Member';
import { hinatazakaMemberMock } from './mockData/hinatazakaMemberMock';  

export async function getHinatazakaMember(): Promise<Member[]> {
  // USE_MOCK環境変数をチェックしてモックデータの使用を決定
  const useMock = process.env.USE_MOCK === "true";

  if (useMock) {  
    console.log('モックデータを使用中（USE_MOCK=true）');  
    return hinatazakaMemberMock;  
  }  
  
  const bigquery = new BigQuery();

  const query = `
   SELECT
     *
   FROM
     sakamichipenlightquiz.sakamichi.hinatazaka_member_master
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
