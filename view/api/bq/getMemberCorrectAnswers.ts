"use server";

import type { MemberCorrectAnswers } from '@/types/MemberCorrectAnswers';
import type { Group } from './common/queryUtils';
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
 * 指定したグループのメンバー正答数記録を取得する関数
 * 
 * @param group 取得対象のグループ ('hinatazaka' | 'sakurazaka')
 * @param memberId 特定のメンバーIDを指定（省略時は全メンバー）
 * @returns Promise<MemberCorrectAnswers[]> メンバー正答数記録の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * // 日向坂46の全メンバーの正答数を取得
 * const allAnswers = await getMemberCorrectAnswers('hinatazaka');
 * 
 * // 特定メンバーの正答数を取得
 * const memberAnswers = await getMemberCorrectAnswers('hinatazaka', 1);
 * ```
 */
export async function getMemberCorrectAnswers(
  group: Group,
  memberId?: number
): Promise<MemberCorrectAnswers[]> {
  const apiName = 'getMemberCorrectAnswers';
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group, memberId });

  // モック環境の場合はモックデータから抽出
  if (environment.useMock) {
    logMockUsage(apiName);
    
    let filteredData = memberCorrectAnswersMock.filter(record => record.group === group);
    
    if (memberId !== undefined) {
      filteredData = filteredData.filter(record => record.member_id === memberId);
    }
    
    logApiComplete(apiName, filteredData.length);
    return filteredData;
  }

  try {
    // WHERE条件の構築
    let whereConditions = [`\`group\` = '${group}'`];
    
    if (memberId !== undefined) {
      whereConditions.push(`member_id = ${memberId}`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // BigQueryクエリ
    const query = `
      SELECT 
        id,
        member_id,
        \`group\`,
        correct_count,
        total_count,
        TIMESTAMP_MILLIS(UNIX_MILLIS(created_at)) AS created_at,
        TIMESTAMP_MILLIS(UNIX_MILLIS(updated_at)) AS updated_at
      FROM \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.member_correct_answers\`
      WHERE ${whereClause}
      ORDER BY member_id ASC, updated_at DESC
    `;
    
    const result: QueryResult<any> = await executeQuery(query);
    
    // データ型の確認とキャスト
    const validatedData = result.data.map(row => {
      if (!row.id || !row.member_id || !row.group || 
          row.correct_count === undefined || row.total_count === undefined) {
        throw createApiError(
          ApiErrorCode.INVALID_DATA,
          '無効なデータ形式が含まれています',
          undefined,
          { invalidRow: row }
        );
      }
      return row as MemberCorrectAnswers;
    });
    
    logApiComplete(apiName, validatedData.length, result.executionTime);
    return validatedData;

  } catch (error) {
    return handleApiError(apiName, error as Error, []);
  }
}