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
 * テーブル存在確認結果のキャッシュ
 */
let tableExistsCache: Map<string, { exists: boolean; cachedAt: number }> = new Map();

/**
 * テーブル存在確認キャッシュの有効期限（30分）
 */
const TABLE_EXISTS_CACHE_EXPIRY = 30 * 60 * 1000;

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
 * BigQueryクライアントのシングルトンインスタンスをリセット（テスト用）
 * 
 * @param clearCache テーブル存在確認キャッシュもクリアするかどうか
 */
export function resetBigQueryClient(clearCache = false): void {
  bigqueryInstance = null;
  if (clearCache) {
    tableExistsCache.clear();
  }
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
    console.log('BigQueryクエリ実行開始:', {
      query: query.trim(),
      location: config.location,
      dryRun: queryOptions.dryRun,
      maxResults: queryOptions.maxResults
    });

    const [job] = await bigquery.createQueryJob(queryOptions);
    console.log('BigQueryジョブ開始: %s', job.id);

    const [rows] = await job.getQueryResults();
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // ジョブの統計情報を取得
    const [metadata] = await job.getMetadata();
    const totalBytesProcessed = metadata?.statistics?.query?.totalBytesProcessed;

    console.log('BigQueryクエリ完了:', {
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
    
    console.error('BigQueryクエリエラー:', {
      query: query.trim(),
      executionTime: `${executionTime.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new Error(`BigQueryクエリの実行に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * テーブルの存在確認を行う関数（キャッシュ付き）
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
  const finalProjectId = projectId || DEFAULT_CONFIG.projectId;
  const cacheKey = `${finalProjectId}.${datasetId}.${tableId}`;
  const now = Date.now();
  
  // キャッシュから確認
  const cached = tableExistsCache.get(cacheKey);
  if (cached && (now - cached.cachedAt) < TABLE_EXISTS_CACHE_EXPIRY) {
    console.log('テーブル存在確認（キャッシュ）: %s - %s', cacheKey, cached.exists ? '存在' : '存在しない');
    return cached.exists;
  }
  
  try {
    const bigquery = getBigQueryClient(projectId ? { projectId } : undefined);
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    
    const [exists] = await table.exists();
    
    // キャッシュに保存
    tableExistsCache.set(cacheKey, { exists, cachedAt: now });
    
    console.log('テーブル存在確認（新規）: %s - %s', cacheKey, exists ? '存在' : '存在しない');
    
    return exists;
  } catch (error) {
    console.error('テーブル存在確認エラー: %s', cacheKey, error);
    
    // エラー時もキャッシュ（短時間）
    tableExistsCache.set(cacheKey, { exists: false, cachedAt: now });
    
    return false;
  }
}

/**
 * 複数のクエリを並列実行する関数
 * 
 * @param queries 実行するクエリ配列（名前付き）
 * @param options クエリ実行オプション
 * @returns 各クエリの実行結果（名前付き）
 */
export async function executeQueriesParallel<T = any>(
  queries: Array<{ name: string; query: string }>,
  options?: QueryOptions
): Promise<Record<string, QueryResult<T>>> {
  const startTime = performance.now();
  
  console.log('並列クエリ実行開始:', queries.map(q => q.name));
  
  try {
    // 全クエリを並列実行
    const results = await Promise.all(
      queries.map(async ({ name, query }) => {
        const result = await executeQuery<T>(query, options);
        return { name, result };
      })
    );
    
    const endTime = performance.now();
    const totalExecutionTime = endTime - startTime;
    
    // 結果をオブジェクト形式に変換
    const namedResults: Record<string, QueryResult<T>> = {};
    results.forEach(({ name, result }) => {
      namedResults[name] = result;
    });
    
    console.log('並列クエリ実行完了:', {
      queries: queries.map(q => q.name),
      totalExecutionTime: `${totalExecutionTime.toFixed(2)}ms`,
      individualTimes: results.map(({ name, result }) => ({
        name,
        time: `${result.executionTime?.toFixed(2)}ms`
      }))
    });
    
    return namedResults;
  } catch (error) {
    const endTime = performance.now();
    const totalExecutionTime = endTime - startTime;
    
    console.error('並列クエリ実行エラー:', {
      queries: queries.map(q => q.name),
      totalExecutionTime: `${totalExecutionTime.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
}
