"use server";

import type { Member } from '@/types/Member';
import type { PenlightColor } from '@/types/PenlightColor';
import { executeQuery, checkTableExists, type QueryResult } from './bigqueryClient';
import { 
  getApiEnvironment, 
  handleApiError, 
  logApiStart, 
  logApiComplete, 
  logMockUsage,
  logError,
  createApiError,
  ApiErrorCode
} from './errorHandling';

/**
 * 坂道グループの種類
 */
export type Group = 'hinatazaka' | 'sakurazaka';

/**
 * BigQueryテーブル名の設定
 */
export const TABLE_NAMES = {
  hinatazaka: {
    member: 'hinatazaka_member_master',
    penlight: 'hinatazaka_penlight'
  },
  sakurazaka: {
    member: 'sakurazaka_member_master', 
    penlight: 'sakurazaka_penlight'
  }
} as const;

/**
 * BigQueryのデータセット・プロジェクト設定
 */
export const BIGQUERY_CONFIG = {
  projectId: 'sakamichipenlightquiz',
  dataset: 'sakamichi',
  location: 'US'
} as const;

/**
 * メンバーデータ取得用のSQLクエリを生成
 * 
 * @param group 対象グループ（hinatazaka | sakurazaka）
 * @returns SQLクエリ文字列
 */
export function buildMemberQuery(group: Group): string {
  const tableName = TABLE_NAMES[group].member;
  
  return `
    SELECT
      id,
      name,
      nickname,
      emoji,
      gen,
      graduated,
      penlight1_id,
      penlight2_id,
      type,
      url
    FROM
      \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.${tableName}\`
    ORDER BY
      gen ASC, id ASC
  `.trim();
}

/**
 * ペンライト色データ取得用のSQLクエリを生成
 * 
 * @param group 対象グループ（hinatazaka | sakurazaka）
 * @returns SQLクエリ文字列
 */
export function buildPenlightQuery(group: Group): string {
  const tableName = TABLE_NAMES[group].penlight;
  
  return `
    SELECT
      id,
      name_ja,
      name_en,
      color
    FROM
      \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.${tableName}\`
    ORDER BY
      id ASC
  `.trim();
}

/**
 * データ検証：メンバーデータの必須フィールドをチェック
 * 
 * @param data 検証対象のデータ
 * @returns 検証済みのメンバーデータ
 * @throws ApiError 必須フィールドが不足している場合
 */
export function validateMemberData(data: any[]): Member[] {
  if (!Array.isArray(data)) {
    throw createApiError(
      ApiErrorCode.DATA_VALIDATION_ERROR,
      'メンバーデータが配列形式ではありません'
    );
  }

  return data.map((item, index) => {
    const requiredFields = ['id', 'name', 'penlight1_id', 'penlight2_id'];
    const missingFields = requiredFields.filter(field => item[field] === undefined || item[field] === null);
    
    if (missingFields.length > 0) {
      throw createApiError(
        ApiErrorCode.DATA_VALIDATION_ERROR,
        `メンバーデータ（インデックス: ${index}）に必須フィールドが不足しています: ${missingFields.join(', ')}`,
        undefined,
        { missingFields, item }
      );
    }
    
    return {
      id: Number(item.id),
      name: String(item.name),
      nickname: String(item.nickname || ''),
      emoji: String(item.emoji || ''),
      gen: String(item.gen || ''),
      graduated: Boolean(item.graduated),
      penlight1_id: Number(item.penlight1_id),
      penlight2_id: Number(item.penlight2_id),
      type: String(item.type || ''),
      url: String(item.url || '')
    } as Member;
  });
}

/**
 * データ検証：ペンライト色データの必須フィールドをチェック
 * 
 * @param data 検証対象のデータ
 * @returns 検証済みのペンライト色データ
 * @throws ApiError 必須フィールドが不足している場合
 */
export function validatePenlightData(data: any[]): PenlightColor[] {
  if (!Array.isArray(data)) {
    throw createApiError(
      ApiErrorCode.DATA_VALIDATION_ERROR,
      'ペンライト色データが配列形式ではありません'
    );
  }

  return data.map((item, index) => {
    const requiredFields = ['id', 'name_ja', 'name_en', 'color'];
    const missingFields = requiredFields.filter(field => item[field] === undefined || item[field] === null);
    
    if (missingFields.length > 0) {
      throw createApiError(
        ApiErrorCode.DATA_VALIDATION_ERROR,
        `ペンライト色データ（インデックス: ${index}）に必須フィールドが不足しています: ${missingFields.join(', ')}`,
        undefined,
        { missingFields, item }
      );
    }
    
    return {
      id: Number(item.id),
      name_ja: String(item.name_ja),
      name_en: String(item.name_en),
      color: String(item.color)
    } as PenlightColor;
  });
}

/**
 * メンバーデータをBigQueryから取得する共通関数
 * 
 * @param group 対象グループ（hinatazaka | sakurazaka）
 * @param mockData フォールバック用のモックデータ
 * @returns メンバーデータの配列
 */
export async function fetchMemberData(
  group: Group,
  mockData: Member[]
): Promise<Member[]> {
  const apiName = `get${group.charAt(0).toUpperCase() + group.slice(1)}Member`;
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group });

  // モック環境の場合は即座にモックデータを返す
  if (environment.useMock) {
    logMockUsage(apiName);
    logApiComplete(apiName, mockData.length);
    return mockData;
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
    return handleApiError(apiName, error as Error, mockData);
  }
}

/**
 * ペンライト色データをBigQueryから取得する共通関数
 * 
 * @param group 対象グループ（hinatazaka | sakurazaka）
 * @param mockData フォールバック用のモックデータ
 * @returns ペンライト色データの配列
 */
export async function fetchPenlightData(
  group: Group,
  mockData: PenlightColor[]
): Promise<PenlightColor[]> {
  const apiName = `get${group.charAt(0).toUpperCase() + group.slice(1)}Penlight`;
  const environment = getApiEnvironment();
  
  logApiStart(apiName, { group });

  // モック環境の場合は即座にモックデータを返す
  if (environment.useMock) {
    logMockUsage(apiName);
    logApiComplete(apiName, mockData.length);
    return mockData;
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
    return handleApiError(apiName, error as Error, mockData);
  }
}

