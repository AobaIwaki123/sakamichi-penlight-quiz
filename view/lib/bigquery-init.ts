/**
 * BigQueryクライアントの事前初期化モジュール
 * アプリケーション起動時に実行して初期化遅延を最小化
 */

import { initializeBigQueryClient } from '@/api/bq/common/bigqueryClient';
import { getApiEnvironment } from '@/api/bq/common/errorHandling';

/**
 * BigQueryクライアントの事前初期化を実行
 * 本番環境のみで実行し、開発環境ではスキップする
 */
export async function preInitializeBigQuery(): Promise<void> {
  const environment = getApiEnvironment();
  
  // モック環境では初期化をスキップ
  if (environment.useMock) {
    console.log('モック環境のためBigQuery事前初期化をスキップ');
    return;
  }

  try {
    console.log('BigQuery事前初期化を開始...');
    const startTime = performance.now();
    
    await initializeBigQueryClient();
    
    const initTime = performance.now() - startTime;
    console.log(`BigQuery事前初期化完了 (${initTime.toFixed(2)}ms)`);
  } catch (error) {
    console.warn('BigQuery事前初期化に失敗（実行時に再試行されます）:', error);
    // 事前初期化の失敗はアプリケーションの起動を阻害しない
  }
}

/**
 * アプリケーション起動時の最適化処理
 * 複数の初期化処理を並列実行
 */
export async function initializeApplication(): Promise<void> {
  console.log('アプリケーション初期化開始...');
  const startTime = performance.now();

  // 並列で実行できる初期化処理
  const initTasks = [
    preInitializeBigQuery(),
    // 他の初期化処理があればここに追加
  ];

  // すべての初期化処理を並列実行（失敗しても続行）
  const results = await Promise.allSettled(initTasks);
  
  // 失敗した初期化処理をログ出力
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`初期化処理 ${index} が失敗:`, result.reason);
    }
  });

  const totalTime = performance.now() - startTime;
  console.log(`アプリケーション初期化完了 (${totalTime.toFixed(2)}ms)`);
}

// サーバーサイドでのみ実行（クライアントサイドでは実行しない）
if (typeof window === 'undefined') {
  // Next.js のサーバーサイド起動時に自動実行
  initializeApplication().catch(error => {
    console.error('アプリケーション初期化中にエラーが発生:', error);
  });
}