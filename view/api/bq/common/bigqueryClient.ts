"use server";

import { BigQuery, Query } from '@google-cloud/bigquery';

/**
 * BigQuery設定インターフェース
 */
export interface BigQueryConfig {
  /** プロジェクトID */
  projectId: string;
  /** ロケーション（デフォルト: US） */
  location: string;
  /** クエリタイムアウト（ミリ秒、デフォルト: 30秒） */
  timeoutMs: number;
  /** クエリキャッシュを使用するか（デフォルト: true） */
  useQueryCache: boolean;
}

/**
 * デフォルトBigQuery設定
 */
const DEFAULT_CONFIG: BigQueryConfig = {
  projectId: 'sakamichipenlightquiz',
  location: 'US',
  timeoutMs: 30000,
  useQueryCache: true
};

/**
 * BigQueryクライアントのシングルトンインスタンス
 */
let bigqueryInstance: BigQuery | null = null;

/**
 * BigQueryクライアントのシングルトンインスタンスを取得
 * 
 * @param config BigQuery設定（オプション）
 * @returns BigQueryクライアントインスタンス
 */
export function getBigQueryClient(config?: Partial<BigQueryConfig>): BigQuery {
  if (!bigqueryInstance) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    bigqueryInstance = new BigQuery({
      projectId: finalConfig.projectId
    });
  }
  return bigqueryInstance;
}

/**
 * BigQueryクエリ実行オプション
 */
export interface QueryOptions extends Partial<BigQueryConfig> {
  /** DryRunモード（実際にクエリを実行せずに検証のみ） */
  dryRun?: boolean;
  /** 最大結果行数 */
  maxResults?: number;
}

/**
 * BigQueryクエリ実行結果
 */
export interface QueryResult<T = any> {
  /** クエリ結果データ */
  data: T[];
  /** ジョブID */
  jobId: string | undefined;
  /** 実行時間（ミリ秒） */
  executionTime: number;
  /** 処理されたバイト数 */
  totalBytesProcessed?: string;
}

/**
 * 安全にBigQueryクエリを実行する共通関数
 * 
 * @param query 実行するSQLクエリ
 * @param options クエリ実行オプション
 * @returns クエリ実行結果
 * @throws Error クエリ実行エラー
 */
export async function executeQuery<T = any>(
  query: string,
  options?: QueryOptions
): Promise<QueryResult<T>> {
  const startTime = performance.now();
  const config = { ...DEFAULT_CONFIG, ...options };
  const bigquery = getBigQueryClient(config);

  const queryOptions: Query = {
    query: query.trim(),
    location: config.location,
    jobTimeoutMs: config.timeoutMs,
    dryRun: options?.dryRun || false,
    useQueryCache: config.useQueryCache,
    maxResults: options?.maxResults
  };

  try {
    console.log(`BigQueryクエリ実行開始:`, {
      query: query.trim(),
      location: config.location,
      dryRun: queryOptions.dryRun,
      maxResults: queryOptions.maxResults
    });

    const [job] = await bigquery.createQueryJob(queryOptions);
    console.log(`BigQueryジョブ開始: ${job.id}`);

    const [rows] = await job.getQueryResults();
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // ジョブの統計情報を取得
    const [metadata] = await job.getMetadata();
    const totalBytesProcessed = metadata?.statistics?.query?.totalBytesProcessed;

    console.log(`BigQueryクエリ完了:`, {
      jobId: job.id,
      rowCount: rows.length,
      executionTime: `${executionTime.toFixed(2)}ms`,
      totalBytesProcessed
    });

    return {
      data: rows as T[],
      jobId: job.id,
      executionTime,
      totalBytesProcessed
    };

  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    console.error(`BigQueryクエリエラー:`, {
      query: query.trim(),
      executionTime: `${executionTime.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new Error(`BigQueryクエリの実行に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * テーブルの存在確認を行う関数
 * 
 * @param datasetId データセットID
 * @param tableId テーブルID
 * @param projectId プロジェクトID（オプション、デフォルトは設定値）
 * @returns テーブルが存在するかどうか
 */
export async function checkTableExists(
  datasetId: string,
  tableId: string,
  projectId?: string
): Promise<boolean> {
  try {
    const bigquery = getBigQueryClient(projectId ? { projectId } : undefined);
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    
    const [exists] = await table.exists();
    console.log(`テーブル存在確認: ${projectId || DEFAULT_CONFIG.projectId}.${datasetId}.${tableId} - ${exists ? '存在' : '存在しない'}`);
    
    return exists;
  } catch (error) {
    console.error('テーブル存在確認エラー: %s.%s', datasetId, tableId, error);
    return false;
  }
}

/**
 * BigQueryクライアントインスタンスをリセット（主にテスト用）
 */
export function resetBigQueryClient(): void {
  bigqueryInstance = null;
}
