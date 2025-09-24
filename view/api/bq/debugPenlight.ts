"use server";

import { checkTableExists, executeQuery } from "./common/bigqueryClient";
import {
  ApiErrorCode,
  createApiError,
  logApiComplete,
  logApiStart,
  logDebug,
  logError,
} from "./common/errorHandling";
import { BIGQUERY_CONFIG, type Group, TABLE_NAMES } from "./common/queryUtils";

/**
 * デバッグ結果のインターフェース
 */
export interface DebugResult {
  /** テーブルが存在するかどうか */
  exists: boolean;
  /** テーブルスキーマ情報 */
  schema?: any[];
  /** データ件数 */
  count?: number;
  /** サンプルデータ */
  sample?: any[];
  /** カラム情報 */
  columns?: any[];
  /** エラー情報（存在する場合） */
  error?: string;
  /** 実行時間（ミリ秒） */
  executionTime?: number;
}

/**
 * ペンライトテーブルのデバッグ用関数
 * テーブル構造とデータサンプルを確認する
 *
 * @param group デバッグ対象のグループ（'hinatazaka' | 'sakurazaka'）
 * @returns Promise<DebugResult> デバッグ結果
 *
 * @example
 * ```typescript
 * const result = await debugPenlightTable('hinatazaka');
 * if (result.exists) {
 *   console.log(`データ件数: ${result.count}`);
 *   console.log('サンプルデータ:', result.sample);
 * }
 * ```
 */
export async function debugPenlightTable(group: Group): Promise<DebugResult> {
  // グループの簡単なバリデーション
  if (!["hinatazaka", "sakurazaka"].includes(group)) {
    throw createApiError(
      ApiErrorCode.DATA_VALIDATION_ERROR,
      `無効なグループです: ${group}`
    );
  }

  const apiName = `debugPenlightTable:${group}`;
  const startTime = performance.now();

  logApiStart(apiName, { group });
  console.log(`=== ${group} ペンライトテーブルデバッグ開始 ===`);

  try {
    // 1. テーブル存在確認
    const tableName = TABLE_NAMES[group].penlight;
    const exists = await checkTableExists(BIGQUERY_CONFIG.dataset, tableName);

    if (!exists) {
      logDebug(apiName, "テーブルが存在しないため、デバッグを終了します");
      return {
        exists: false,
        executionTime: performance.now() - startTime,
      };
    }

    logDebug(apiName, "テーブル存在を確認、詳細情報を取得中...");

    // 2. データ件数確認
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.${tableName}\`
    `;

    const countResult = await executeQuery(countQuery);
    const count = countResult.data[0]?.count || 0;
    logDebug(apiName, `データ件数: ${count}件`);

    // 3. サンプルデータ取得
    const sampleQuery = `
      SELECT * 
      FROM \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.${tableName}\`
      ORDER BY id ASC
      LIMIT 5
    `;

    const sampleResult = await executeQuery(sampleQuery);
    logDebug(apiName, "サンプルデータ:", sampleResult.data);

    // 4. カラム情報の確認（INFORMATION_SCHEMAを使用）
    let columns: any[] = [];
    try {
      const columnQuery = `
        SELECT column_name, data_type, is_nullable
        FROM \`${BIGQUERY_CONFIG.projectId}.${BIGQUERY_CONFIG.dataset}.INFORMATION_SCHEMA.COLUMNS\`
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position
      `;

      const columnResult = await executeQuery(columnQuery);
      columns = columnResult.data;
      logDebug(apiName, "カラム情報:", columns);
    } catch (schemaError) {
      logError(apiName, schemaError as Error, {
        message: "INFORMATION_SCHEMAアクセスエラー（権限問題の可能性）",
      });
    }

    const executionTime = performance.now() - startTime;

    const result: DebugResult = {
      exists: true,
      count,
      sample: sampleResult.data,
      columns,
      executionTime,
    };

    logApiComplete(apiName, count, executionTime);
    console.log(`=== ${group} ペンライトテーブルデバッグ完了 ===`);

    return result;
  } catch (error) {
    const executionTime = performance.now() - startTime;
    logError(apiName, error as Error);

    return {
      exists: false,
      error: String(error),
      executionTime,
    };
  }
}

/**
 * 複数グループのペンライトテーブルを一括でデバッグする
 *
 * @param groups デバッグ対象のグループ配列（省略時は全グループ）
 * @returns Promise<Record<Group, DebugResult>> グループ別のデバッグ結果
 *
 * @example
 * ```typescript
 * // 全グループをデバッグ
 * const results = await debugAllPenlightTables();
 * Object.entries(results).forEach(([group, result]) => {
 *   console.log(`${group}: ${result.exists ? 'OK' : 'NG'}`);
 * });
 *
 * // 特定グループのみをデバッグ
 * const specificResults = await debugAllPenlightTables(['hinatazaka']);
 * ```
 */
export async function debugAllPenlightTables(
  groups: Group[] = ["hinatazaka", "sakurazaka"]
): Promise<Record<Group, DebugResult>> {
  const apiName = "debugAllPenlightTables";
  logApiStart(apiName, { groups });

  // 並列でデバッグを実行
  const debugPromises = groups.map(
    async (group): Promise<[Group, DebugResult]> => {
      const result = await debugPenlightTable(group);
      return [group, result];
    }
  );

  const results = await Promise.all(debugPromises);
  const resultMap = Object.fromEntries(results) as Record<Group, DebugResult>;

  const totalCount = Object.values(resultMap).reduce(
    (sum, result) => sum + (result.count || 0),
    0
  );
  logApiComplete(apiName, totalCount);

  return resultMap;
}
