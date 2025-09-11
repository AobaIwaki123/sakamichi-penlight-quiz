"use server";

import type { Member } from '@/types/Member';
import { nogizakaMemberMock } from './mockData/nogizakaMemberMock';
import { executeQuery, checkTableExists, type QueryResult } from './common/bigqueryClient';
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
  buildMemberQuery, 
  validateMemberData,
  TABLE_NAMES,
  BIGQUERY_CONFIG
} from './common/queryUtils';

/**
 * BigQueryから乃木坂46のメンバー情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<Member[]> 乃木坂46メンバー情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const members = await getNogizakaMember();
 * console.log(`取得したメンバー数: ${members.length}`);
 * ```
 */
export async function getNogizakaMember(): Promise<Member[]> {
  const group = 'nogizaka';
  const apiName = 'getNogizakaMember';
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group });

  // モック環境の場合は即座にモックデータを返す
  if (environment.useMock) {
    logMockUsage(apiName);
    logApiComplete(apiName, nogizakaMemberMock.length);
    return nogizakaMemberMock;
  }

  try {
    // テーブル存在確認
    const tableName = TABLE_NAMES[group].member;
    const tableExists = await checkTableExists(BIGQUERY_CONFIG.dataset, tableName);
    
    if (!tableExists) {
      throw createApiError(
        ApiErrorCode.TABLE_NOT_FOUND,
        `メンバーテーブルが存在しません: ${tableName}`,
        undefined,
        { group, tableName }
      );
    }

    // BigQueryクエリ実行
    const query = buildMemberQuery(group);
    const result: QueryResult<any> = await executeQuery(query);
    
    // データ検証
    const validatedData = validateMemberData(result.data);
    
    logApiComplete(apiName, validatedData.length, result.executionTime);
    return validatedData;

  } catch (error) {
    return handleApiError(apiName, error as Error, nogizakaMemberMock);
  }
}