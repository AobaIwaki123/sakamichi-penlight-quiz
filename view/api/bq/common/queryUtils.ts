import type { Member } from '@/types/Member';
import type { PenlightColor } from '@/types/PenlightColor';
import { 
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
 * @param options クエリオプション
 * @returns SQLクエリ文字列
 */
export function buildMemberQuery(group: Group, options?: {
  /** アクティブメンバーのみ取得 */
  activeOnly?: boolean;
  /** 結果の上限数 */
  limit?: number;
}): string {
  const tableName = TABLE_NAMES[group].member;
  const { activeOnly = false, limit } = options || {};
  
  let query = `
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
  `;
  
  // アクティブメンバーのみのフィルター
  if (activeOnly) {
    query += `
    WHERE graduated = false
    `;
  }
  
  // 効率的なソート（インデックス活用）
  query += `
    ORDER BY gen ASC, id ASC
  `;
  
  // 結果数制限
  if (limit && limit > 0) {
    query += `
    LIMIT ${limit}
    `;
  }
  
  return query.trim();
}

/**
 * ペンライト色データ取得用のSQLクエリを生成
 * 
 * @param group 対象グループ（hinatazaka | sakurazaka）
 * @param options クエリオプション
 * @returns SQLクエリ文字列
 */
export function buildPenlightQuery(group: Group, options?: {
  /** 結果の上限数 */
  limit?: number;
}): string {
  const tableName = TABLE_NAMES[group].penlight;
  const { limit } = options || {};
  
  let query = `
    SELECT
      id,
      name_ja,
      name_en,
      color
    FROM
      \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.${tableName}\`
    ORDER BY
      id ASC
  `;
  
  // 結果数制限（通常は不要だが、安全のため）
  if (limit && limit > 0) {
    query += `
    LIMIT ${limit}
    `;
  }
  
  return query.trim();
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


