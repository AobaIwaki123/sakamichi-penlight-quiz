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
 * デフォルトBigQuery設定（パフォーマンス最適化済み）
 */
const DEFAULT_CONFIG: BigQueryConfig = {
  projectId: 'sakamichipenlightquiz',
  location: 'US',
  timeoutMs: 20000, // タイムアウトを20秒に短縮
  useQueryCache: true
};

/**
 * BigQueryクライアントのシングルトンインスタンス
 */
let bigqueryInstance: BigQuery | null = null;

/**
 * BigQueryクライアントの初期化プロミス（初回のみ実行）
 */
let initializationPromise: Promise<BigQuery> | null = null;

/**
 * BigQueryクライアントのシングルトンインスタンスを取得
 * パフォーマンス最適化のため、初期化を並行実行可能にする
 * 
 * @param config BigQuery設定（オプション）
 * @returns BigQueryクライアントインスタンス
 */
export function getBigQueryClient(config?: Partial<BigQueryConfig>): BigQuery {
  if (!bigqueryInstance) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    bigqueryInstance = new BigQuery({
      projectId: finalConfig.projectId,
      // パフォーマンス最適化のためのオプション
      maxRetries: 3,
      autoRetry: true,
      // BigQuery SDKでサポートされているオプションのみ使用
    });
  }
  return bigqueryInstance;
}

/**
 * BigQueryクライアントを非同期で事前初期化する
 * アプリケーション起動時に呼び出して初期化時間を短縮
 * 
 * @param config BigQuery設定（オプション）
 * @returns BigQueryクライアントインスタンスのプロミス
 */
export async function initializeBigQueryClient(config?: Partial<BigQueryConfig>): Promise<BigQuery> {
  if (!initializationPromise) {
    initializationPromise = Promise.resolve().then(() => {
      console.log('BigQueryクライアントを事前初期化中...');
      const client = getBigQueryClient(config);
      console.log('BigQueryクライアントの事前初期化完了');
      return client;
    });
  }
  return initializationPromise;
}

/**
 * BigQueryクエリ実行オプション
 */
export interface QueryOptions extends Partial<BigQueryConfig> {
  /** DryRunモード（実際にクエリを実行せずに検証のみ） */
  dryRun?: boolean;
  /** 最大結果行数 */
  maxResults?: number;
  /** テーブル存在確認をスキップするか（パフォーマンス最適化） */
  skipTableCheck?: boolean;
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
  /** キャッシュから取得したかどうか */
  cacheHit?: boolean;
}

/**
 * 安全にBigQueryクエリを実行する共通関数
 * パフォーマンス最適化済み：並列処理、キャッシュヒット検出、統計情報取得の最適化
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
  
  // 事前初期化されたクライアントを使用（初期化遅延を回避）
  const bigquery = await initializeBigQueryClient(config);

  const queryOptions: Query = {
    query: query.trim(),
    location: config.location,
    jobTimeoutMs: config.timeoutMs,
    dryRun: options?.dryRun || false,
    useQueryCache: config.useQueryCache,
    maxResults: options?.maxResults,
    // パフォーマンス最適化：結果の並列取得を有効化
    createDisposition: 'CREATE_NEVER', // テーブル作成を無効化
    writeDisposition: 'WRITE_EMPTY'    // 書き込みを無効化
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

    // 結果取得と統計情報取得を並列実行してパフォーマンス向上
    const [rowsPromise, metadataPromise] = await Promise.allSettled([
      job.getQueryResults(),
      job.getMetadata()
    ]);

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // 結果の処理
    if (rowsPromise.status === 'rejected') {
      throw new Error(`クエリ結果の取得に失敗: ${rowsPromise.reason}`);
    }
    const [rows] = rowsPromise.value;

    // 統計情報の処理（エラーでも処理を続行）
    let totalBytesProcessed: string | undefined;
    let cacheHit = false;
    
    if (metadataPromise.status === 'fulfilled') {
      const [metadata] = metadataPromise.value;
      totalBytesProcessed = metadata?.statistics?.query?.totalBytesProcessed;
      cacheHit = metadata?.statistics?.query?.cacheHit || false;
    } else {
      console.warn('統計情報の取得に失敗:', metadataPromise.reason);
    }

    console.log('BigQueryクエリ完了:', {
      jobId: job.id,
      rowCount: rows.length,
      executionTime: `${executionTime.toFixed(2)}ms`,
      totalBytesProcessed,
      cacheHit: cacheHit ? 'HIT' : 'MISS'
    });

    return {
      data: rows as T[],
      jobId: job.id,
      executionTime,
      totalBytesProcessed,
      cacheHit
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
 * テーブル存在確認のキャッシュ（パフォーマンス最適化）
 */
const tableExistsCache = new Map<string, { exists: boolean; cachedAt: number }>();
const TABLE_CACHE_EXPIRY = 5 * 60 * 1000; // 5分間のキャッシュ

/**
 * テーブルの存在確認を行う関数（キャッシュ機能付き）
 * パフォーマンス最適化のため、一定時間結果をキャッシュする
 * 
 * @param datasetId データセットID
 * @param tableId テーブルID
 * @param projectId プロジェクトID（オプション、デフォルトは設定値）
 * @param useCache キャッシュを使用するか（デフォルト: true）
 * @returns テーブルが存在するかどうか
 */
export async function checkTableExists(
  datasetId: string,
  tableId: string,
  projectId?: string,
  useCache: boolean = true
): Promise<boolean> {
  const cacheKey = `${projectId || DEFAULT_CONFIG.projectId}.${datasetId}.${tableId}`;
  
  // キャッシュ確認（パフォーマンス最適化）
  if (useCache) {
    const cached = tableExistsCache.get(cacheKey);
    if (cached && (Date.now() - cached.cachedAt) < TABLE_CACHE_EXPIRY) {
      console.log(`テーブル存在確認キャッシュヒット: ${cacheKey}`);
      return cached.exists;
    }
  }

  try {
    const bigquery = await initializeBigQueryClient();
    const dataset = bigquery.dataset(datasetId, { projectId: projectId || DEFAULT_CONFIG.projectId });
    const table = dataset.table(tableId);
    
    const [exists] = await table.exists();
    
    // 結果をキャッシュに保存
    if (useCache) {
      tableExistsCache.set(cacheKey, { exists, cachedAt: Date.now() });
      console.log(`テーブル存在確認結果をキャッシュに保存: ${cacheKey} = ${exists}`);
    }
    
    return exists;
  } catch (error) {
    console.error(`テーブル存在確認エラー: ${cacheKey}`, error);
    // エラー時はfalseを返す（安全側に倒す）
    return false;
  }
}

/**
 * BigQueryクライアントインスタンスをリセット（主にテスト用）
 */
export function resetBigQueryClient(): void {
  bigqueryInstance = null;
}
