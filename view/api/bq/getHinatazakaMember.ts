 "use server";

import { BigQuery } from '@google-cloud/bigquery';

import type { Member } from '@/types/Member';
import { hinatazakaMemberMock } from './mockData/hinatazakaMemberMock';  

export async function getHinatazakaMember(): Promise<Member[]> {
  // 環境変数DEV_MODEをチェック  
  const isDevMode = process.env.NODE_ENV === "development"; 

    // devモードの場合はモックデータを返す  
  if (isDevMode) {  
    console.log('Using mock data in DEV_MODE');  
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
