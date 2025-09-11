"use server";

import type { PenlightColor } from '@/types/PenlightColor';
import { hinatazakaPenlightMock } from './mockData/hinatazakaPenlightMock';
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
  buildPenlightQuery, 
  validatePenlightData,
  TABLE_NAMES,
  BIGQUERY_CONFIG
} from './common/queryUtils';

/**
 * BigQueryから日向坂46のペンライト色情報を取得する関数
 * USE_MOCK環境変数がtrueの場合はモックデータを返し、falseの場合はBigQueryから取得する
 * 
 * @returns Promise<PenlightColor[]> 日向坂46ペンライト色情報の配列
 * @throws Error BigQuery接続エラーまたはクエリ実行エラー
 * 
 * @example
 * ```typescript
 * const colors = await getHinatazakaPenlight();
 * console.log(`取得した色数: ${colors.length}`);
 * colors.forEach(color => console.log(`${color.name_ja}: ${color.color}`));
 * ```
 */
export async function getHinatazakaPenlight(): Promise<PenlightColor[]> {
  const group = 'hinatazaka';
  const apiName = 'getHinatazakaPenlight';
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group });

  // モック環境の場合は即座にモックデータを返す
  if (environment.useMock) {
    logMockUsage(apiName);
    logApiComplete(apiName, hinatazakaPenlightMock.length);
    return hinatazakaPenlightMock;
  }

  try {
    // テーブル存在確認
    const tableName = TABLE_NAMES[group].penlight;
    const tableExists = await checkTableExists(BIGQUERY_CONFIG.dataset, tableName);
    
    if (!tableExists) {
      throw createApiError(
        ApiErrorCode.TABLE_NOT_FOUND,
        `ペンライトテーブルが存在しません: ${tableName}`,
        undefined,
        { group, tableName }
      );
    }

    // BigQueryクエリ実行
    const query = buildPenlightQuery(group);
    const result: QueryResult<any> = await executeQuery(query);
    
    // データ検証
    const validatedData = validatePenlightData(result.data);
    
    logApiComplete(apiName, validatedData.length, result.executionTime);
    return validatedData;

  } catch (error) {
    return handleApiError(apiName, error as Error, hinatazakaPenlightMock);
  }
}
