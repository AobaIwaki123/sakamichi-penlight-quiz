"use server";

/**
 * 坂道ペンライトクイズAPI統合エントリーポイント
 * すべてのBigQuery API関数をここから提供する
 */

// 型定義のエクスポート
export type { Member } from "@/types/Member";
export type { PenlightColor } from "@/types/PenlightColor";
export {
  type BigQueryConfig,
  checkTableExists,
  executeQuery,
  getBigQueryClient,
  type QueryOptions,
  type QueryResult,
  resetBigQueryClient,
} from "./common/bigqueryClient";
export {
  type ApiEnvironment,
  type ApiError,
  ApiErrorCode,
  createApiError,
  getApiEnvironment,
  handleApiError,
  logApiComplete,
  logApiStart,
  logDebug,
  logError,
  logFallback,
  logMockUsage,
  logSuccess,
} from "./common/errorHandling";

// 共通ユーティリティとエラーハンドリングのエクスポート
export {
  BIGQUERY_CONFIG,
  type Group,
  TABLE_NAMES,
} from "./common/queryUtils";
// デバッグ関数のエクスポート
export { debugPenlightTable } from "./debugPenlight";
// 基本API関数のエクスポート
export { getHinatazakaMember } from "./getHinatazakaMember";
export { getHinatazakaPenlight } from "./getHinatazakaPenlight";
export { getSakurazakaMember } from "./getSakurazakaMember";
export { getSakurazakaPenlight } from "./getSakurazakaPenlight";

/**
 * 指定されたグループのメンバー情報を取得する統合関数
 *
 * @param group 取得対象のグループ（'hinatazaka' | 'sakurazaka'）
 * @returns Promise<Member[]> メンバー情報の配列
 * @throws Error 無効なグループ名またはAPI呼び出しエラー
 *
 * @example
 * ```typescript
 * // 日向坂46のメンバー情報を取得
 * const hinatazakaMembers = await getMembersByGroup('hinatazaka');
 *
 * // 櫻坂46のメンバー情報を取得
 * const sakurazakaMembers = await getMembersByGroup('sakurazaka');
 * ```
 */
export async function getMembersByGroup(
  group: import("./common/queryUtils").Group
): Promise<import("@/types/Member").Member[]> {
  switch (group) {
    case "hinatazaka":
      return (await import("./getHinatazakaMember")).getHinatazakaMember();
    case "sakurazaka":
      return (await import("./getSakurazakaMember")).getSakurazakaMember();
    default:
      // TypeScriptの型システムによって、ここには到達しないはず
      throw new Error(`サポートされていないグループです: ${group}`);
  }
}

/**
 * 指定されたグループのペンライト色情報を取得する統合関数
 *
 * @param group 取得対象のグループ（'hinatazaka' | 'sakurazaka'）
 * @returns Promise<PenlightColor[]> ペンライト色情報の配列
 * @throws Error 無効なグループ名またはAPI呼び出しエラー
 *
 * @example
 * ```typescript
 * // 日向坂46のペンライト色情報を取得
 * const hinatazakaColors = await getPenlightByGroup('hinatazaka');
 *
 * // 櫻坂46のペンライト色情報を取得
 * const sakurazakaColors = await getPenlightByGroup('sakurazaka');
 * ```
 */
export async function getPenlightByGroup(
  group: import("./common/queryUtils").Group
): Promise<import("@/types/PenlightColor").PenlightColor[]> {
  switch (group) {
    case "hinatazaka":
      return (await import("./getHinatazakaPenlight")).getHinatazakaPenlight();
    case "sakurazaka":
      return (await import("./getSakurazakaPenlight")).getSakurazakaPenlight();
    default:
      // TypeScriptの型システムによって、ここには到達しないはず
      throw new Error(`サポートされていないグループです: ${group}`);
  }
}

/**
 * 指定されたグループの完全なデータセット（メンバー情報とペンライト色）を取得する
 *
 * @param group 取得対象のグループ（'hinatazaka' | 'sakurazaka'）
 * @returns Promise<{members: Member[], colors: PenlightColor[]}> 完全なデータセット
 * @throws Error 無効なグループ名またはAPI呼び出しエラー
 *
 * @example
 * ```typescript
 * // 日向坂46の完全なデータセットを取得
 * const { members, colors } = await getCompleteDataByGroup('hinatazaka');
 * console.log(`メンバー数: ${members.length}, 色数: ${colors.length}`);
 * ```
 */
export async function getCompleteDataByGroup(
  group: import("./common/queryUtils").Group
): Promise<{
  members: import("@/types/Member").Member[];
  colors: import("@/types/PenlightColor").PenlightColor[];
}> {
  const { logApiStart, logApiComplete } = await import(
    "./common/errorHandling"
  );

  logApiStart("getCompleteDataByGroup", { group });

  const startTime = performance.now();

  // 並列でメンバー情報とペンライト色情報を取得
  const [members, colors] = await Promise.all([
    getMembersByGroup(group),
    getPenlightByGroup(group),
  ]);

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  logApiComplete(
    "getCompleteDataByGroup",
    members.length + colors.length,
    executionTime
  );

  return { members, colors };
}
