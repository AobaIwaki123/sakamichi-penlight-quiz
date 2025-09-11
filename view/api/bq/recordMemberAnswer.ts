"use server";

import type { CreateOrUpdateCorrectAnswersRequest, MemberCorrectAnswers } from '@/types/MemberCorrectAnswers';
import { memberCorrectAnswersMock } from './mockData/memberCorrectAnswersMock';
import { executeQuery, type QueryResult } from './common/bigqueryClient';
import { 
  getApiEnvironment, 
  handleApiError, 
  logApiStart, 
  logApiComplete, 
  logMockUsage,
  createApiError,
  ApiErrorCode
} from './common/errorHandling';
import { 
  BIGQUERY_CONFIG
} from './common/queryUtils';

/**
 * メンバーの回答結果を記録または更新する関数
 * 既存レコードがある場合は正答数・総出題数を更新し、ない場合は新規作成する
 * 
 * @param request 記録リクエスト（メンバーID、グループ、正解フラグ）
 * @returns Promise<MemberCorrectAnswers> 更新後の正答数記録
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * // 正解した場合
 * const result = await recordMemberAnswer({
 *   member_id: 1,
 *   group: 'hinatazaka',
 *   is_correct: true
 * });
 * console.log(`正答数: ${result.correct_count}/${result.total_count}`);
 * ```
 */
export async function recordMemberAnswer(
  request: CreateOrUpdateCorrectAnswersRequest
): Promise<MemberCorrectAnswers> {
  const apiName = 'recordMemberAnswer';
  const environment = getApiEnvironment();
  
  logApiStart(apiName, request);

  // モック環境の場合は模擬的な更新処理
  if (environment.useMock) {
    logMockUsage(apiName);
    
    // 既存レコードを探す
    let existingRecord = memberCorrectAnswersMock.find(
      r => r.member_id === request.member_id && r.group === request.group
    );
    
    if (existingRecord) {
      // 既存レコードの更新
      existingRecord.total_count += 1;
      if (request.is_correct) {
        existingRecord.correct_count += 1;
      }
      existingRecord.updated_at = new Date().toISOString();
      logApiComplete(apiName, 1);
      return existingRecord;
    } else {
      // 新規レコード作成
      const newRecord: MemberCorrectAnswers = {
        id: Math.max(...memberCorrectAnswersMock.map(r => r.id)) + 1,
        member_id: request.member_id,
        group: request.group,
        correct_count: request.is_correct ? 1 : 0,
        total_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memberCorrectAnswersMock.push(newRecord);
      logApiComplete(apiName, 1);
      return newRecord;
    }
  }

  try {
    const currentTime = 'CURRENT_TIMESTAMP()';
    
    // MERGE文を使用してUPSERT処理
    const mergeQuery = `
      MERGE \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.member_correct_answers\` AS target
      USING (
        SELECT 
          ${request.member_id} AS member_id,
          '${request.group}' AS group_name,
          ${request.is_correct ? 1 : 0} AS is_correct,
          ${currentTime} AS current_time
      ) AS source
      ON target.member_id = source.member_id 
         AND target.group = source.group_name
      WHEN MATCHED THEN
        UPDATE SET
          correct_count = target.correct_count + source.is_correct,
          total_count = target.total_count + 1,
          updated_at = source.current_time
      WHEN NOT MATCHED THEN
        INSERT (member_id, group, correct_count, total_count, created_at, updated_at)
        VALUES (
          source.member_id, 
          source.group_name, 
          source.is_correct, 
          1, 
          source.current_time, 
          source.current_time
        )
    `;

    // MERGE文を実行
    const mergeResult: QueryResult<any> = await executeQuery(mergeQuery);
    
    // 更新されたレコードを取得
    const selectQuery = `
      SELECT 
        id,
        member_id,
        \`group\`,
        correct_count,
        total_count,
        TIMESTAMP_MILLIS(UNIX_MILLIS(created_at)) AS created_at,
        TIMESTAMP_MILLIS(UNIX_MILLIS(updated_at)) AS updated_at
      FROM \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.member_correct_answers\`
      WHERE member_id = ${request.member_id} AND \`group\` = '${request.group}'
      LIMIT 1
    `;
    
    const selectResult: QueryResult<any> = await executeQuery(selectQuery);
    
    if (!selectResult.data || selectResult.data.length === 0) {
      throw createApiError(
        ApiErrorCode.DATA_NOT_FOUND,
        'レコードの作成または更新後の取得に失敗しました',
        undefined,
        request
      );
    }

    const updatedRecord = selectResult.data[0] as MemberCorrectAnswers;
    
    logApiComplete(apiName, 1, mergeResult.executionTime + selectResult.executionTime);
    return updatedRecord;

  } catch (error) {
    throw handleApiError(apiName, error as Error);
  }
}