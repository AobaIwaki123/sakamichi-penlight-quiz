"use server";

import { BigQuery } from '@google-cloud/bigquery';

import type { Member } from '@/types/Member';
import { sakurazakaMemberMock } from './mockData/sakurazakaMemberMock';  

export async function getSakurazakaMember(): Promise<Member[]> {
  const isDevMode = process.env.NODE_ENV === "development"; 

  if (isDevMode) {  
    console.log('Using mock data in DEV_MODE');  
    return sakurazakaMemberMock;  
  }  
  
  const bigquery = new BigQuery();

  const query = `
   SELECT
     *
   FROM
     sakamichipenlightquiz.sakamichi.sakurazaka_member_master
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
