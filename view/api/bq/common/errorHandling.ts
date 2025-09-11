"use server";

/**
 * API実行環境の設定
 */
export interface ApiEnvironment {
  /** モックデータを使用するかどうか */
  useMock: boolean;
  /** 環境名（development, production等） */
  environment: string;
}

/**
 * 現在のAPI実行環境を取得する
 * 
 * @returns API実行環境の設定
 */
export function getApiEnvironment(): ApiEnvironment {
  const useMock = process.env.USE_MOCK === "true";
  const environment = process.env.NODE_ENV || "development";
  
  return {
    useMock,
    environment
  };
}

/**
 * APIエラーの共通インターフェース
 */
export interface ApiError extends Error {
  /** エラーコード */
  code: string;
  /** 元のエラー（存在する場合） */
  cause?: Error;
  /** エラーの詳細情報 */
  details?: Record<string, any>;
}

/**
 * APIエラーの種類
 */
export enum ApiErrorCode {
  /** BigQuery接続エラー */
  BIGQUERY_CONNECTION_ERROR = 'BIGQUERY_CONNECTION_ERROR',
  /** BigQueryクエリエラー */
  BIGQUERY_QUERY_ERROR = 'BIGQUERY_QUERY_ERROR',
  /** テーブル存在しないエラー */
  TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
  /** データ検証エラー */
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  /** 不明なエラー */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * APIエラーを作成する関数
 * 
 * @param code エラーコード
 * @param message エラーメッセージ
 * @param cause 元のエラー（オプション）
 * @param details エラーの詳細情報（オプション）
 * @returns APIエラーインスタンス
 */
export function createApiError(
  code: ApiErrorCode,
  message: string,
  cause?: Error,
  details?: Record<string, any>
): ApiError {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.cause = cause;
  error.details = details;
  return error;
}

/**
 * エラーログ出力の共通関数
 * 
 * @param context エラーが発生したコンテキスト
 * @param error 発生したエラー
 * @param additionalInfo 追加の情報（オプション）
 */
export function logError(
  context: string,
  error: Error | ApiError,
  additionalInfo?: Record<string, any>
): void {
  console.error('[%s] エラーが発生しました:', context, {
    message: error.message,
    code: (error as ApiError).code || 'UNKNOWN',
    cause: (error as ApiError).cause?.message,
    details: (error as ApiError).details,
    additionalInfo,
    stack: error.stack
  });
}

/**
 * 成功ログ出力の共通関数
 * 
 * @param context 処理が完了したコンテキスト
 * @param message 成功メッセージ
 * @param data 関連データ（オプション）
 */
export function logSuccess(
  context: string,
  message: string,
  data?: Record<string, any>
): void {
  console.log('[%s] %s', context, message, data || {});
}

/**
 * デバッグログ出力の共通関数
 * 
 * @param context デバッグ対象のコンテキスト
 * @param message デバッグメッセージ
 * @param data 関連データ（オプション）
 */
export function logDebug(
  context: string,
  message: string,
  data?: Record<string, any>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG:%s] %s', context, message, data || {});
  }
}

/**
 * APIコールの開始ログを出力
 * 
 * @param apiName API名
 * @param params APIパラメータ（オプション）
 */
export function logApiStart(
  apiName: string,
  params?: Record<string, any>
): void {
  const environment = getApiEnvironment();
  logDebug(apiName, `API呼び出し開始`, {
    useMock: environment.useMock,
    environment: environment.environment,
    params
  });
}

/**
 * APIコールの完了ログを出力
 * 
 * @param apiName API名
 * @param resultCount 取得結果件数
 * @param executionTime 実行時間（ミリ秒、オプション）
 */
export function logApiComplete(
  apiName: string,
  resultCount: number,
  executionTime?: number
): void {
  logSuccess(apiName, `API呼び出し完了`, {
    resultCount,
    executionTime: executionTime ? `${executionTime.toFixed(2)}ms` : undefined
  });
}

/**
 * フォールバック実行のログ出力
 * 
 * @param apiName API名
 * @param reason フォールバックの理由
 * @param fallbackType フォールバック先（'mock', 'cache'等）
 */
export function logFallback(
  apiName: string,
  reason: string,
  fallbackType: string
): void {
  console.warn('[%s] %s - %sデータにフォールバックします', apiName, reason, fallbackType);
}

/**
 * モックデータ使用のログ出力
 * 
 * @param apiName API名
 * @param reason モックデータを使用する理由
 */
export function logMockUsage(
  apiName: string,
  reason: string = 'USE_MOCK=true'
): void {
  console.log('[%s] モックデータを使用中（%s）', apiName, reason);
}

/**
 * 共通のエラーハンドリング関数
 * 本番環境では適切なフォールバック処理を実行し、
 * 開発環境では詳細なエラー情報を出力する
 * 
 * @param apiName API名
 * @param error 発生したエラー
 * @param fallbackData フォールバックデータ
 * @returns フォールバックデータまたはエラーの再スロー
 */
export function handleApiError<T>(
  apiName: string,
  error: Error,
  fallbackData: T
): T {
  const environment = getApiEnvironment();
  
  // エラーログを出力
  logError(apiName, error, { environment });
  
  // 開発環境ではより詳細な情報を出力
  if (environment.environment === 'development') {
    console.error('[%s] 開発環境での詳細エラー情報:', apiName, {
      stack: error.stack,
      name: error.name,
      message: error.message
    });
  }
  
  // フォールバックデータが提供されている場合は使用
  if (fallbackData !== undefined) {
    logFallback(apiName, error.message, 'mock');
    return fallbackData;
  }
  
  // フォールバックデータがない場合はエラーを再スロー
  throw createApiError(
    ApiErrorCode.UNKNOWN_ERROR,
    `${apiName}でエラーが発生し、フォールバックデータも利用できません`,
    error
  );
}
