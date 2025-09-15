// Cloud Run ヘルスチェック用 API エンドポイント
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Cloud Run ヘルスチェックエンドポイント
 * アプリケーションの基本的な動作確認を行う
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
    // 基本的なヘルスチェック項目
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || 'unknown',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      pid: process.pid,
    };

    // BigQuery 接続確認（軽量チェック）
    let bigqueryStatus = 'unknown';
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // 認証情報が設定されているかのみチェック
        bigqueryStatus = 'configured';
      } else {
        bigqueryStatus = 'not_configured';
      }
    } catch (error) {
      bigqueryStatus = 'error';
    }

    const response = {
      ...healthStatus,
      services: {
        bigquery: bigqueryStatus,
      },
    };

    // 正常レスポンス
    res.status(200).json(response);

  } catch (error) {
    console.error('Health check failed:', error);
    
    // エラーレスポンス
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}