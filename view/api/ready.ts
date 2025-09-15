// Cloud Run レディネスチェック用 API エンドポイント
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Cloud Run レディネスチェックエンドポイント
 * アプリケーションがリクエストを受け付ける準備ができているかを確認
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET メソッドのみ許可
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Method not allowed' 
    });
  }

  try {
    // レディネスチェック項目
    const checks = [];
    let isReady = true;

    // 1. 基本的なアプリケーション状態チェック
    checks.push({
      name: 'application',
      status: 'ready',
      message: 'Application is running',
    });

    // 2. 環境変数チェック
    const requiredEnvVars = ['NODE_ENV'];
    const envCheck = {
      name: 'environment',
      status: 'ready',
      message: 'Environment variables configured',
    };

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        envCheck.status = 'not_ready';
        envCheck.message = `Missing required environment variable: ${envVar}`;
        isReady = false;
        break;
      }
    }
    checks.push(envCheck);

    // 3. BigQuery 認証情報チェック（本番環境のみ）
    if (process.env.NODE_ENV === 'production') {
      const bigqueryCheck = {
        name: 'bigquery_auth',
        status: 'ready',
        message: 'BigQuery authentication configured',
      };

      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GCP_SA_KEY) {
        bigqueryCheck.status = 'not_ready';
        bigqueryCheck.message = 'BigQuery authentication not configured';
        isReady = false;
      }
      
      checks.push(bigqueryCheck);
    } else {
      // 開発環境では BigQuery チェックをスキップ
      checks.push({
        name: 'bigquery_auth',
        status: 'skipped',
        message: 'BigQuery check skipped in development mode',
      });
    }

    // 4. メモリ使用量チェック
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryLimitMB = 2048; // 2GB (Cloud Run のデフォルト上限を想定)
    
    const memoryCheck = {
      name: 'memory',
      status: memoryUsedMB < memoryLimitMB * 0.9 ? 'ready' : 'warning',
      message: `Memory usage: ${memoryUsedMB}MB`,
      details: {
        used: memoryUsedMB,
        limit: memoryLimitMB,
        percentage: Math.round((memoryUsedMB / memoryLimitMB) * 100),
      },
    };

    if (memoryUsedMB > memoryLimitMB * 0.95) {
      memoryCheck.status = 'not_ready';
      memoryCheck.message = `Memory usage too high: ${memoryUsedMB}MB`;
      isReady = false;
    }
    
    checks.push(memoryCheck);

    // 5. アップタイムチェック（起動直後は not_ready）
    const uptimeSeconds = process.uptime();
    const uptimeCheck = {
      name: 'uptime',
      status: uptimeSeconds > 10 ? 'ready' : 'not_ready',
      message: `Uptime: ${Math.round(uptimeSeconds)}s`,
      details: {
        uptime_seconds: uptimeSeconds,
      },
    };

    if (uptimeSeconds <= 10) {
      isReady = false;
    }
    
    checks.push(uptimeCheck);

    // レスポンス作成
    const response = {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
      summary: {
        total_checks: checks.length,
        ready_checks: checks.filter(c => c.status === 'ready').length,
        warning_checks: checks.filter(c => c.status === 'warning').length,
        not_ready_checks: checks.filter(c => c.status === 'not_ready').length,
        skipped_checks: checks.filter(c => c.status === 'skipped').length,
      },
    };

    // ステータスコードの決定
    const statusCode = isReady ? 200 : 503;
    
    res.status(statusCode).json(response);

  } catch (error) {
    console.error('Readiness check failed:', error);
    
    // エラーレスポンス
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: [
        {
          name: 'readiness_check',
          status: 'error',
          message: 'Readiness check failed with error',
        },
      ],
    });
  }
}