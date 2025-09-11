import { BigQuery } from '@google-cloud/bigquery';

// ============================================================================
// 型定義
// ============================================================================

/**
 * BigQueryに保存する連続正解記録の型
 */
interface StreakRecordForBQ {
  /** 記録ID（UUID） */
  id: string;
  /** 連続正解数 */
  streak_count: number;
  /** 記録開始時刻 */
  started_at: string;
  /** 記録終了時刻 */
  ended_at: string | null;
  /** 最後に正解した時刻 */
  last_correct_at: string;
  /** 作成時刻 */
  created_at: string;
}

/**
 * APIレスポンス用の連続正解統計データ
 */
interface StreakStats {
  /** 合計正解数 */
  total_correct: number;
  /** 合計回答数 */
  total_answers: number;
  /** 最高連続正解数 */
  best_streak: number;
  /** 連続正解記録の数 */
  total_records: number;
  /** 正解率 */
  accuracy: number;
}

// ============================================================================
// BigQuery設定
// ============================================================================

const PROJECT_ID = 'sakamichipenlightquiz';
const DATASET_ID = 'sakamichi';
const STREAK_TABLE_ID = 'streak_records';

/**
 * BigQueryクライアントを取得
 */
function getBigQueryClient(): BigQuery {
  return new BigQuery({
    projectId: PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
}

// ============================================================================
// API関数
// ============================================================================

/**
 * 連続正解記録をBigQueryに保存する
 * @param record 保存する連続正解記録
 * @returns 成功時はtrue、失敗時はfalse
 */
export async function saveStreakRecord(record: {
  id: string;
  streakCount: number;
  startedAt: string;
  endedAt?: string;
  lastCorrectAt: string;
}): Promise<boolean> {
  // 開発モードでは実際の保存はスキップ
  const isDevMode = process.env.NODE_ENV === "development";
  
  if (isDevMode) {
    console.log('開発モード: 連続正解記録の保存をスキップ', record);
    return true;
  }

  try {
    const bigquery = getBigQueryClient();
    
    const bqRecord: StreakRecordForBQ = {
      id: record.id,
      streak_count: record.streakCount,
      started_at: record.startedAt,
      ended_at: record.endedAt || null,
      last_correct_at: record.lastCorrectAt,
      created_at: new Date().toISOString()
    };

    // BigQueryテーブルに挿入
    const query = `
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${STREAK_TABLE_ID}\`
      (id, streak_count, started_at, ended_at, last_correct_at, created_at)
      VALUES
      (@id, @streak_count, @started_at, @ended_at, @last_correct_at, @created_at)
    `;

    const options = {
      query: query,
      location: 'US',
      params: bqRecord
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`連続正解記録保存ジョブ開始: ${job.id}`);
    
    await job.getQueryResults();
    console.log(`連続正解記録を保存しました: ${record.streakCount}連続正解`);
    
    return true;
  } catch (error) {
    console.error('連続正解記録の保存に失敗:', error);
    return false;
  }
}

/**
 * 連続正解統計をBigQueryから取得する
 * @returns 統計データまたはnull（失敗時）
 */
export async function getStreakStats(): Promise<StreakStats | null> {
  // 開発モードではモック統計を返す
  const isDevMode = process.env.NODE_ENV === "development";
  
  if (isDevMode) {
    console.log('開発モード: モック統計データを返します');
    return {
      total_correct: 42,
      total_answers: 58,
      best_streak: 8,
      total_records: 5,
      accuracy: 0.724
    };
  }

  try {
    const bigquery = getBigQueryClient();
    
    const query = `
      SELECT
        COUNT(*) as total_records,
        MAX(streak_count) as best_streak,
        SUM(streak_count) as total_correct,
        -- 概算の合計回答数（実装によってはより正確な計算が必要）
        CAST(SUM(streak_count) / 0.7 AS INT64) as estimated_total_answers
      FROM \`${PROJECT_ID}.${DATASET_ID}.${STREAK_TABLE_ID}\`
      WHERE ended_at IS NOT NULL OR streak_count > 0
    `;

    const options = {
      query: query,
      location: 'US'
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`連続正解統計取得ジョブ開始: ${job.id}`);
    
    const [rows] = await job.getQueryResults();
    
    if (rows.length === 0) {
      console.log('統計データが見つかりません');
      return {
        total_correct: 0,
        total_answers: 0,
        best_streak: 0,
        total_records: 0,
        accuracy: 0
      };
    }

    const row = rows[0];
    const stats: StreakStats = {
      total_correct: parseInt(row.total_correct) || 0,
      total_answers: parseInt(row.estimated_total_answers) || 0,
      best_streak: parseInt(row.best_streak) || 0,
      total_records: parseInt(row.total_records) || 0,
      accuracy: 0
    };

    // 正解率を計算
    if (stats.total_answers > 0) {
      stats.accuracy = stats.total_correct / stats.total_answers;
    }

    console.log('連続正解統計を取得しました:', stats);
    return stats;
    
  } catch (error) {
    console.error('連続正解統計の取得に失敗:', error);
    return null;
  }
}

/**
 * 上位の連続正解記録をBigQueryから取得する
 * @param limit 取得する記録数の上限（デフォルト: 10）
 * @returns 連続正解記録の配列
 */
export async function getTopStreakRecords(limit: number = 10): Promise<StreakRecordForBQ[]> {
  // 開発モードではモック記録を返す
  const isDevMode = process.env.NODE_ENV === "development";
  
  if (isDevMode) {
    console.log('開発モード: モック連続正解記録を返します');
    return [
      {
        id: 'mock-1',
        streak_count: 15,
        started_at: '2025-09-11T10:00:00.000Z',
        ended_at: '2025-09-11T10:30:00.000Z',
        last_correct_at: '2025-09-11T10:30:00.000Z',
        created_at: '2025-09-11T10:30:00.000Z'
      },
      {
        id: 'mock-2',
        streak_count: 8,
        started_at: '2025-09-11T09:00:00.000Z',
        ended_at: '2025-09-11T09:15:00.000Z',
        last_correct_at: '2025-09-11T09:15:00.000Z',
        created_at: '2025-09-11T09:15:00.000Z'
      }
    ];
  }

  try {
    const bigquery = getBigQueryClient();
    
    const query = `
      SELECT
        id,
        streak_count,
        started_at,
        ended_at,
        last_correct_at,
        created_at
      FROM \`${PROJECT_ID}.${DATASET_ID}.${STREAK_TABLE_ID}\`
      WHERE streak_count >= 2  -- 2回以上の連続正解のみ対象
      ORDER BY streak_count DESC, started_at DESC
      LIMIT @limit
    `;

    const options = {
      query: query,
      location: 'US',
      params: { limit }
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`上位連続正解記録取得ジョブ開始: ${job.id}`);
    
    const [rows] = await job.getQueryResults();
    
    console.log(`${rows.length}件の連続正解記録を取得しました`);
    return rows as StreakRecordForBQ[];
    
  } catch (error) {
    console.error('連続正解記録の取得に失敗:', error);
    return [];
  }
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * UUIDを生成する（簡易版）
 * @returns UUID文字列
 */
export function generateStreakId(): string {
  return 'streak_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}