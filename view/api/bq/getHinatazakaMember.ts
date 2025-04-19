 "use server";

import { BigQuery } from '@google-cloud/bigquery';

import type { Member } from '@/types/Member';

export async function getHinatazakaMember(): Promise<Member[]> {
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
