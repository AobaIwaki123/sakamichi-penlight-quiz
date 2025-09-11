import type { Group } from '@/api/bq/common/queryUtils';

/**
 * メンバーごとの正答数記録を表すインターフェース
 */
export interface MemberCorrectAnswers {
  /** 記録ID */
  id: number;
  /** メンバーID（Member.idとの関連） */
  member_id: number;
  /** グループ名（hinatazaka/sakurazaka） */
  group: Group;
  /** 正答数 */
  correct_count: number;
  /** 総出題数 */
  total_count: number;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}

/**
 * 正答数記録の作成・更新用リクエスト型
 */
export interface CreateOrUpdateCorrectAnswersRequest {
  /** メンバーID */
  member_id: number;
  /** グループ名 */
  group: Group;
  /** 正解したかどうか */
  is_correct: boolean;
}

/**
 * 正答数統計情報
 */
export interface CorrectAnswersStats {
  /** メンバーID */
  member_id: number;
  /** グループ名 */
  group: Group;
  /** 正答数 */
  correct_count: number;
  /** 総出題数 */
  total_count: number;
  /** 正答率（0-1の小数） */
  correct_rate: number;
  /** 最終更新日時 */
  last_updated: string;
}