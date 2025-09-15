/**
 * BigQuery バッチクエリ実行モジュール
 * 複数のクエリを並列実行してパフォーマンスを最適化
 */

import { executeQuery, type QueryOptions, type QueryResult } from './bigqueryClient';

/**
 * バッチクエリ実行の設定
 */
export interface BatchQueryOptions {
  /** 並列実行数の上限（デフォルト: 3） */
  maxConcurrency?: number;
  /** 各クエリのオプション */
  queryOptions?: QueryOptions;
}

/**
 * バッチクエリの実行結果
 */
export interface BatchQueryResult<T = any> {
  /** クエリ名 */
  name: string;
  /** 実行結果（成功時） */
  result?: QueryResult<T>;
  /** エラー（失敗時） */
  error?: Error;
  /** 実行時間（ミリ秒） */
  executionTime: number;
}

/**
 * 複数のBigQueryクエリを並列実行する関数
 * パフォーマンス最適化のため、メンバーとペンライトデータを同時取得可能
 * 
 * @param queries 実行するクエリのマップ（名前 -> SQLクエリ）
 * @param options バッチ実行オプション
 * @returns 各クエリの実行結果
 */
export async function executeBatchQueries<T = any>(
  queries: Record<string, string>,
  options: BatchQueryOptions = {}
): Promise<Record<string, BatchQueryResult<T>>> {
  const { maxConcurrency = 3, queryOptions = {} } = options;
  const queryEntries = Object.entries(queries);
  const results: Record<string, BatchQueryResult<T>> = {};

  console.log(`バッチクエリ実行開始: ${queryEntries.length}件のクエリを並列実行`);
  const batchStartTime = performance.now();

  // セマフォパターンで並列実行数を制御
  const semaphore = new Semaphore(maxConcurrency);
  
  const promises = queryEntries.map(async ([name, query]) => {
    return semaphore.acquire(async () => {
      const startTime = performance.now();
      
      try {
        console.log(`クエリ実行開始: ${name}`);
        const result = await executeQuery<T>(query, queryOptions);
        const executionTime = performance.now() - startTime;
        
        results[name] = {
          name,
          result,
          executionTime
        };
        
        console.log(`クエリ実行完了: ${name} (${executionTime.toFixed(2)}ms)`);
      } catch (error) {
        const executionTime = performance.now() - startTime;
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        results[name] = {
          name,
          error: errorObj,
          executionTime
        };
        
        console.error(`クエリ実行失敗: ${name} (${executionTime.toFixed(2)}ms)`, errorObj.message);
      }
    });
  });

  // すべてのクエリの完了を待機
  await Promise.allSettled(promises);
  
  const batchExecutionTime = performance.now() - batchStartTime;
  console.log(`バッチクエリ実行完了: ${queryEntries.length}件 (${batchExecutionTime.toFixed(2)}ms)`);

  return results;
}

/**
 * メンバーとペンライトデータを並列取得する専用関数
 * 
 * @param group 対象グループ（hinatazaka | sakurazaka）
 * @param options バッチ実行オプション
 * @returns メンバーとペンライトデータの実行結果
 */
export async function fetchMemberAndPenlightData(
  group: 'hinatazaka' | 'sakurazaka',
  options: BatchQueryOptions = {}
): Promise<{
  members: BatchQueryResult;
  penlight: BatchQueryResult;
}> {
  const queries = {
    members: buildMemberQuery(group),
    penlight: buildPenlightQuery(group)
  };

  const results = await executeBatchQueries(queries, {
    ...options,
    maxConcurrency: 2 // メンバーとペンライトの2つのクエリを並列実行
  });

  return {
    members: results.members,
    penlight: results.penlight
  };
}

/**
 * セマフォクラス（並列実行数制御）
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--;
        this.executeTask(task, resolve, reject);
      } else {
        this.waitQueue.push(() => {
          this.permits--;
          this.executeTask(task, resolve, reject);
        });
      }
    });
  }

  private async executeTask<T>(
    task: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (error: any) => void
  ): Promise<void> {
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.release();
    }
  }

  private release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) {
        next();
      }
    }
  }
}

// クエリビルダー関数（他のモジュールから移植）
function buildMemberQuery(group: 'hinatazaka' | 'sakurazaka'): string {
  const tableName = group === 'hinatazaka' 
    ? 'hinatazaka_member_master' 
    : 'sakurazaka_member_master';
  
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
      \`sakamichipenlightquiz.sakamichi.${tableName}\`
    ORDER BY gen, id
  `.trim();
}

function buildPenlightQuery(group: 'hinatazaka' | 'sakurazaka'): string {
  const tableName = group === 'hinatazaka' 
    ? 'hinatazaka_penlight' 
    : 'sakurazaka_penlight';
  
  return `
    SELECT
      id,
      name_ja,
      name_en,
      color
    FROM
      \`sakamichipenlightquiz.sakamichi.${tableName}\`
    ORDER BY id
  `.trim();
}