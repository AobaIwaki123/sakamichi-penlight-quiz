"use client";

import { ServerError500 } from "@/components/Error/ServerError/ServerError500";

/**
 * サーバーエラーページコンポーネント
 * アプリケーション実行時にエラーが発生した場合に表示される
 * Next.js App Routerのエラーハンドリング機能を利用
 *
 * @param error - 発生したエラーオブジェクト
 * @param reset - エラー状態をリセットする関数
 */
export default function ServerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // デバッグ用にエラー情報をログ出力
  console.error("アプリケーションエラーが発生しました:", error);

  return <ServerError500 />;
}
