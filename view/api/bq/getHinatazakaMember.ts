"use server";

import type { Member } from '@/types/Member';
import { hinatazakaMemberMock } from './mockData/hinatazakaMemberMock';
import { executeQuery, checkTableExists, type QueryResult, initializeBigQueryClient } from './common/bigqueryClient';
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
 * BigQueryから日向坂46のメンバー情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<Member[]> 日向坂46メンバー情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const members = await getHinatazakaMember();
 * console.log(`取得したメンバー数: ${members.length}`);
 * ```
 */
export async function getHinatazakaMember(): Promise<Member[]> {
  const group = 'hinatazaka';
  const apiName = 'getHinatazakaMember';
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group });

  // モック環境の場合は即座にモックデータを返す
  if (environment.useMock) {
    logMockUsage(apiName);
    logApiComplete(apiName, hinatazakaMemberMock.length);
    return hinatazakaMemberMock;
  }

  try {
    // パフォーマンス最適化: BigQueryクライアントを事前初期化し、テーブル確認とクエリを並列実行
    const tableName = TABLE_NAMES[group].member;
    const query = buildMemberQuery(group);
    
    // 事前初期化とテーブル確認を並列実行
    const [, tableExists] = await Promise.all([
      initializeBigQueryClient(), // クライアントの事前初期化
      checkTableExists(BIGQUERY_CONFIG.dataset, tableName) // テーブル存在確認
    ]);
    
    if (!tableExists) {
      throw createApiError(
        ApiErrorCode.TABLE_NOT_FOUND,
        `メンバーテーブルが存在しません: ${tableName}`,
        undefined,
        { group, tableName }
      );
    }

    // BigQueryクエリ実行（最適化済みクライアントを使用）
    const result: QueryResult<any> = await executeQuery(query, {
      skipTableCheck: true // テーブル確認は既に完了しているのでスキップ
    });
    
    // データ検証
    const validatedData = validateMemberData(result.data);
    
    logApiComplete(apiName, validatedData.length, result.executionTime);
    return validatedData;

  } catch (error) {
    return handleApiError(apiName, error as Error, hinatazakaMemberMock);
  }
}
