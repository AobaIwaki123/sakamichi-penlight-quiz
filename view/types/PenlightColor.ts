/**
 * ペンライト色情報を表すインターフェース
 */
export interface PenlightColor {
  /** ペンライト色ID */
  id: number;
  /** ペンライト色の日本語名 */
  name_ja: string;
  /** ペンライト色の英語名 */
  name_en: string;
  /** ペンライト色のカラーコード */
  color: string;
}
