"use server";

import type { CorrectAnswersStats } from '@/types/MemberCorrectAnswers';
import type { Group } from './common/queryUtils';
import { memberAnswerStatsMock } from './mockData/memberCorrectAnswersMock';
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
 * 指定したグループのメンバー正答数統計情報を取得する関数
 * 正答率の計算や集計処理を含む
 * 
 * @param group 取得対象のグループ ('hinatazaka' | 'sakurazaka')
 * @param memberId 特定のメンバーIDを指定（省略時は全メンバー）
 * @param sortBy ソート条件 ('correct_rate' | 'correct_count' | 'total_count')
 * @returns Promise<CorrectAnswersStats[]> メンバー正答数統計の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * // 日向坂46の全メンバーの統計を正答率順で取得
 * const stats = await getMemberAnswerStats('hinatazaka', undefined, 'correct_rate');
 * 
 * // 特定メンバーの統計を取得
 * const memberStats = await getMemberAnswerStats('hinatazaka', 1);
 * ```
 */
export async function getMemberAnswerStats(
  group: Group,
  memberId?: number,
  sortBy: 'correct_rate' | 'correct_count' | 'total_count' = 'correct_rate'
): Promise<CorrectAnswersStats[]> {
  const apiName = 'getMemberAnswerStats';
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group, memberId, sortBy });

  // モック環境の場合はモックデータから抽出・計算
  if (environment.useMock) {
    logMockUsage(apiName);
    
    let filteredData = memberAnswerStatsMock.filter(record => record.group === group);
    
    if (memberId !== undefined) {
      filteredData = filteredData.filter(record => record.member_id === memberId);
    }
    
    // ソート処理
    filteredData.sort((a, b) => {
      switch (sortBy) {
        case 'correct_rate':
          return b.correct_rate - a.correct_rate;
        case 'correct_count':
          return b.correct_count - a.correct_count;
        case 'total_count':
          return b.total_count - a.total_count;
        default:
          return b.correct_rate - a.correct_rate;
      }
    });
    
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
    
    // ORDER BY句の構築
    let orderByClause: string;
    switch (sortBy) {
      case 'correct_rate':
        orderByClause = 'correct_rate DESC, correct_count DESC';
        break;
      case 'correct_count':
        orderByClause = 'correct_count DESC, correct_rate DESC';
        break;
      case 'total_count':
        orderByClause = 'total_count DESC, correct_rate DESC';
        break;
      default:
        orderByClause = 'correct_rate DESC, correct_count DESC';
    }
    
    // BigQueryクエリ（正答率の計算を含む）
    const query = `
      SELECT 
        member_id,
        \`group\`,
        correct_count,
        total_count,
        CASE 
          WHEN total_count > 0 THEN ROUND(correct_count / total_count, 4)
          ELSE 0.0
        END AS correct_rate,
        TIMESTAMP_MILLIS(UNIX_MILLIS(updated_at)) AS last_updated
      FROM \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.member_correct_answers\`
      WHERE ${whereClause}
      ORDER BY ${orderByClause}, member_id ASC
    `;
    
    const result: QueryResult<any> = await executeQuery(query);
    
    // データ型の確認とキャスト
    const validatedData = result.data.map(row => {
      if (!row.member_id || !row.group || 
          row.correct_count === undefined || row.total_count === undefined ||
          row.correct_rate === undefined) {
        throw createApiError(
          ApiErrorCode.INVALID_DATA,
          '統計データの形式が無効です',
          undefined,
          { invalidRow: row }
        );
      }
      return {
        member_id: row.member_id,
        group: row.group,
        correct_count: row.correct_count,
        total_count: row.total_count,
        correct_rate: row.correct_rate,
        last_updated: row.last_updated
      } as CorrectAnswersStats;
    });
    
    logApiComplete(apiName, validatedData.length, result.executionTime);
    return validatedData;

  } catch (error) {
    return handleApiError(apiName, error as Error, []);
  }
}